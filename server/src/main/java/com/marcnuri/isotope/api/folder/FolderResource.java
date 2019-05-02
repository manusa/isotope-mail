/*
 * FolderResource.java
 *
 * Created on 2018-08-08, 16:32
 *
 * Copyright 2018 Marc Nuri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageWithFolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import javax.mail.MessagingException;
import javax.mail.URLName;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.configuration.WebConfiguration.IMAP_SERVICE_PROTOTYPE;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;
import static org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@RestController
@RequestMapping(path = "/v1/folders")
@SuppressWarnings("squid:S4529")
public class FolderResource implements ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(FolderResource.class);

    public static final String REL_DOWNLOAD = "download";

    private final ObjectFactory<ImapService> imapServiceFactory;

    private ApplicationContext applicationContext;

    @Autowired
    public FolderResource(ObjectFactory<ImapService> imapServiceFactory) {
        this.imapServiceFactory = imapServiceFactory;
    }

    @GetMapping(path = "", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<List<Folder>> getFolders(
            @RequestParam(value = "loadChildren", required = false) Boolean loadChildren) {

        log.debug("Loading list of folders [children:{}]", loadChildren);
        return ResponseEntity.ok(imapServiceFactory.getObject().getFolders(loadChildren));
    }

    @PostMapping(path = "", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<List<Folder>> createRootFolder(@RequestBody() String newFolderName) {
        log.debug("Creating new 1st level folder with name {}", newFolderName);
        return ResponseEntity.ok(imapServiceFactory.getObject().createRootFolder(newFolderName));
    }

    @PostMapping(path= "/{folderId}", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> createChildFolder(
            @NonNull @PathVariable("folderId") String folderId, @RequestBody() String newFolderName) {

        log.debug("Creating new folder with name {} under {} folder", newFolderName, folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject()
                .createChildFolder(Folder.toId(folderId), newFolderName));
    }

    @DeleteMapping(path= "/{folderId}", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> deleteFolder(@NonNull @PathVariable("folderId") String folderId) {
        log.debug("Deleting folder with id {}", folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject().deleteFolder(Folder.toId(folderId)));
    }

    @PutMapping(path= "/{folderId}/name", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> renameFolder(
            @NonNull @PathVariable("folderId") String folderId, @RequestBody String newName) {
        log.debug("Renaming folder with id {} to {}", folderId, newName);
        return ResponseEntity.ok(imapServiceFactory.getObject().renameFolder(Folder.toId(folderId), newName));
    }

    /**
     * Moves the folder with the provided folderId as a child of the folder with the provided targetFolderId or
     * to the first level if null.
     *
     * @param folderId
     * @param targetFolderId
     * @return
     */
    @PutMapping(path= "/{folderId}/parent", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> moveFolder(
            @PathVariable("folderId") String folderId, @RequestBody(required = false) String targetFolderId) {

        final URLName targetFolderUrlName = targetFolderId == null ? null : Folder.toId(targetFolderId);
        return ResponseEntity.ok(
                imapServiceFactory.getObject().moveFolder(Folder.toId(folderId), targetFolderUrlName));
    }

    @GetMapping(path = "/{folderId}/messages", produces = TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<List<Message>>> getMessages(
            @PathVariable("folderId") String folderId, HttpServletResponse response) {

        log.debug("Loading list of messages for folder {} ", folderId);
        return applicationContext.getBean(IMAP_SERVICE_PROTOTYPE, ImapService.class)
                .getMessagesFlux(Folder.toId(folderId), response)
                .subscribeOn(Schedulers.elastic())
                .publishOn(Schedulers.immediate()) // Will allow server to stop sending events in case client disconnects
                ;
    }

    @GetMapping(path = "/{folderId}/messages")
    public ResponseEntity<List<Message>> preloadMessages(
            @PathVariable("folderId") String folderId, @RequestParam("id") List<Long> messageIds) {

        log.debug("Preloading {} messages for folder {} ", messageIds.size(), folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject().preloadMessages(Folder.toId(folderId), messageIds));
    }

    @DeleteMapping(path = "/{folderId}/messages")
    public ResponseEntity<Folder> deleteAllFolderMessages(@PathVariable("folderId") String folderId) {
        log.debug("Deleting ALL messages for folder {} ", folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject().deleteAllFolderMessages(Folder.toId(folderId)));
    }

    @DeleteMapping(path = "/{folderId}/messages", params = {"id"})
    public ResponseEntity<Folder> deleteMessages(
            @PathVariable("folderId") String folderId, @RequestParam("id") List<Long> messageIds) {

        log.debug("Deleting {} messages for folder {} ", messageIds.size(), folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject().deleteMessages(Folder.toId(folderId), messageIds));
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}")
    public ResponseEntity<MessageWithFolder> getMessage(
            @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId) {

        log.debug("Loading message {} from folder {}", messageId, folderId);
        final MessageWithFolder message = imapServiceFactory.getObject().getMessage(Folder.toId(folderId), messageId);
        addLinks(folderId, message);
        return ResponseEntity.ok(message);
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}", produces = "message/rfc822")
    public ResponseEntity<Void> downloadMessage(
            @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId,
            HttpServletResponse response) throws MessagingException, IOException {

        log.debug("Downloading message {} from folder {} as .eml", messageId, folderId);
        imapServiceFactory.getObject().downloadMessage(Folder.toId(folderId), messageId, response);
        return ResponseEntity.ok().build();
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}/attachments/{id}")
    public ResponseEntity<Void> getAttachment(
            @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId,
            @PathVariable("id") String id, @RequestParam(name="contentId", required = false) Boolean contentId,
            HttpServletResponse response) {

        log.debug("Loading attachment {} from message {} from folder {}", id, messageId, folderId);
        imapServiceFactory.getObject().readAttachment(response, Folder.toId(folderId), messageId, id, contentId);
        return ResponseEntity.ok().build();
    }

    @PutMapping(path = "/{folderId}/messages/folder/{toFolderId}")
    public ResponseEntity<List<MessageWithFolder>> moveMessages(
            @PathVariable("folderId") String fromFolderId,
            @PathVariable("toFolderId") String toFolderId, @NonNull @RequestBody List<Long> messageIds) {

        log.debug("Moving {} messages from folder {} to folder {}", messageIds.size(), fromFolderId, toFolderId);
        final List<MessageWithFolder> movedMessages = imapServiceFactory.getObject().moveMessages(
                Folder.toId(fromFolderId), Folder.toId(toFolderId), messageIds);
        return ResponseEntity.ok(movedMessages);
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/folder/{toFolderId}")
    public ResponseEntity<List<MessageWithFolder>> moveMessage(
            @PathVariable("folderId") String fromFolderId,
            @PathVariable("messageId") Long messageId, @PathVariable("toFolderId") String toFolderId) {

        log.debug("Moving message {} from folder {} to folder {}", messageId, fromFolderId, toFolderId);
        final List<MessageWithFolder> movedMessages = imapServiceFactory.getObject().moveMessages(
                Folder.toId(fromFolderId), Folder.toId(toFolderId), Collections.singletonList(messageId));
        return ResponseEntity.ok(movedMessages);
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/seen")
    public ResponseEntity<Void> setMessageSeen(
            @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId,
            @RequestBody boolean seen) {

        log.debug("Setting message seen attribute to {} in message {} from folder {}", seen, messageId, folderId);
        imapServiceFactory.getObject().setMessagesSeen(Folder.toId(folderId), seen, messageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "/{folderId}/messages/seen/{seen}")
    public ResponseEntity<Void> setMessagesSeen(
            @PathVariable("folderId") @NonNull String folderId,
            @PathVariable("seen") @NonNull Boolean seen, @RequestBody List<Long> messageIds) {

        log.debug("Setting {} messages in folder {} seen attribute to {}" , messageIds.size(), folderId, seen);
        imapServiceFactory.getObject().setMessagesSeen(
                // lgtm[java/dereferenced-value-may-be-null]
                Folder.toId(folderId), seen, messageIds.stream().mapToLong(Long::longValue).toArray());
        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/flagged")
    public ResponseEntity<Void> setMessageFlagged(
            @PathVariable("folderId") String folderId,
            @PathVariable("messageId") Long messageId, @RequestBody boolean flagged) {

        log.debug("Setting message flagged attribute to {} in message {} from folder {}", flagged, messageId, folderId);
        imapServiceFactory.getObject().setMessagesFlagged(Folder.toId(folderId), flagged, messageId);
        return ResponseEntity.noContent().build();
    }

    private static Attachment[] addLinks(String folderId, Message message, Attachment... attachments) {
        Stream.of(attachments).forEach(a -> addLinks(folderId, message, a));
        return attachments;
    }

    public static List<Attachment> addLinks(String folderId, Message message, List<Attachment> attachments) {
        attachments.forEach(a -> addLinks(folderId, message, a));
        return attachments;
    }

    private static Attachment addLinks(String folderId, Message message, Attachment attachment) {
        final boolean isContentId = attachment.getContentId() != null && !attachment.getContentId().isEmpty();
        final String attachmentId = isContentId ? attachment.getContentId() : attachment.getFileName();
        if (attachmentId != null && !attachmentId.isEmpty()) {
            attachment.add(linkTo(methodOn(FolderResource.class).getAttachment(folderId, message.getUid(),
                    attachmentId, isContentId, null))
                    .withRel(REL_DOWNLOAD).expand());
        }
        return attachment;
    }

    @Override
    public void setApplicationContext(@NonNull ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

}
