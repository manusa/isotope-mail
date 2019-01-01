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

import com.marcnuri.isotope.api.credentials.CredentialsService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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

    private static final String REL_MESSAGES = "messages";
    public static final String REL_DOWNLOAD = "download";
    private static final String REL_RENAME = "rename";
    private static final String REL_MOVE = "move";
    private static final String REL_MESSAGE = "message";
    private static final String REL_MESSAGE_FLAGGED = "message.flagged";
    private static final String REL_MESSAGE_MOVE= "message.move";
    private static final String REL_MESSAGE_MOVE_BULK= "message.move.bulk";
    private static final String REL_MESSAGE_SEEN = "message.seen";
    private static final String REL_MESSAGE_SEEN_BULK = "message.seen.bulk";

    private final CredentialsService credentialsService;
    private final ObjectFactory<ImapService> imapServiceFactory;

    private ApplicationContext applicationContext;

    @Autowired
    public FolderResource(CredentialsService credentialsService, ObjectFactory<ImapService> imapServiceFactory) {
        this.credentialsService = credentialsService;
        this.imapServiceFactory = imapServiceFactory;
    }

    @GetMapping(path = "", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<List<Folder>> getFolders(
            HttpServletRequest request, @RequestParam(value = "loadChildren", required = false) Boolean loadChildren) {

        log.debug("Loading list of folders [children:{}]", loadChildren);
        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject()
                .getFolders(credentialsService.fromRequest(request), loadChildren)));
    }

    @PutMapping(path= "/{folderId}/name", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> renameFolder(
            HttpServletRequest request, @NonNull @PathVariable("folderId") String folderId, @RequestBody String newName) {

        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject().renameFolder(
                credentialsService.fromRequest(request), Folder.toId(folderId), newName
        )));
    }

    @PutMapping(path= "/{folderId}/parent", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Folder> moveFolder(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @RequestBody String targetFolderId) {
        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject().moveFolder(
                credentialsService.fromRequest(request), Folder.toId(folderId), Folder.toId(targetFolderId)
        )));
    }

    @GetMapping(path = "/{folderId}/messages", produces = TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<List<Message>>> getMessages(
            @PathVariable("folderId") String folderId, HttpServletRequest request, HttpServletResponse response) {

        log.debug("Loading list of messages for folder {} ", folderId);
        return applicationContext.getBean(IMAP_SERVICE_PROTOTYPE, ImapService.class)
                .getMessagesFlux(credentialsService.fromRequest(request), Folder.toId(folderId), response)
                .subscribeOn(Schedulers.elastic())
                .publishOn(Schedulers.immediate()) // Will allow server to stop sending events in case client disconnects
                ;
    }

    @GetMapping(path = "/{folderId}/messages")
    public ResponseEntity<List<Message>> preloadMessages(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @RequestParam("id") List<Long> messageIds) {

        log.debug("Preloading {} messages for folder {} ", messageIds.size(), folderId);
        return ResponseEntity.ok(imapServiceFactory.getObject()
                .preloadMessages(credentialsService.fromRequest(request), Folder.toId(folderId), messageIds));
    }

    @DeleteMapping(path = "/{folderId}/messages")
    public ResponseEntity<Folder> deleteMessages(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @RequestParam("id") List<Long> messageIds) {

        log.debug("Deleting {} messages for folder {} ", messageIds.size(), folderId);
        final Folder folder = imapServiceFactory.getObject()
                .deleteMessages(credentialsService.fromRequest(request), Folder.toId(folderId), messageIds);
        addLinks(folder);
        return ResponseEntity.ok(folder);
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}")
    public ResponseEntity<MessageWithFolder> getMessage(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId) {

        log.debug("Loading message {} from folder {}", messageId, folderId);
        final MessageWithFolder message = imapServiceFactory.getObject()
                .getMessage(credentialsService.fromRequest(request), Folder.toId(folderId), messageId);
        addLinks(message.getFolder());
        addLinks(folderId, message);
        return ResponseEntity.ok(message);
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}/attachments/{id}")
    public ResponseEntity<Void> getAttachment(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId,
            @PathVariable("id") String id, @RequestParam(name="contentId", required = false) Boolean contentId,
            HttpServletResponse response) {

        log.debug("Loading attachment {} from message {} from folder {}", id, messageId, folderId);
        imapServiceFactory.getObject().readAttachment(response, credentialsService.fromRequest(request),
                Folder.toId(folderId), messageId, id, contentId);
        return ResponseEntity.ok().build();
    }

    @PutMapping(path = "/{fromFolderId}/messages/folder/{toFolderId}")
    public ResponseEntity<List<MessageWithFolder>> moveMessages(
            HttpServletRequest request, @PathVariable("fromFolderId") String fromFolderId,
            @PathVariable("toFolderId") String toFolderId, @NonNull @RequestBody List<Long> messageIds) {

        log.debug("Moving {} messages from folder {} to folder {}", messageIds.size(), fromFolderId, toFolderId);
        final List<MessageWithFolder> movedMessages = imapServiceFactory.getObject().moveMessages(
                credentialsService.fromRequest(request), Folder.toId(fromFolderId), Folder.toId(toFolderId),
                messageIds);
        movedMessages.forEach(mwf -> addLinks(mwf.getFolder()));
        return ResponseEntity.ok(movedMessages);
    }

    @PutMapping(path = "/{fromFolderId}/messages/{messageId}/folder/{toFolderId}")
    public ResponseEntity<List<MessageWithFolder>> moveMessage(
            HttpServletRequest request, @PathVariable("fromFolderId") String fromFolderId,
            @PathVariable("messageId") Long messageId, @PathVariable("toFolderId") String toFolderId) {

        log.debug("Moving message {} from folder {} to folder {}", messageId, fromFolderId, toFolderId);
        final List<MessageWithFolder> movedMessages = imapServiceFactory.getObject().moveMessages(
                credentialsService.fromRequest(request), Folder.toId(fromFolderId), Folder.toId(toFolderId),
                Collections.singletonList(messageId));
        movedMessages.forEach(mwf -> addLinks(mwf.getFolder()));
        return ResponseEntity.ok(movedMessages);
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/seen")
    public ResponseEntity<Void> setMessageSeen(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId,
            @RequestBody boolean seen) {

        log.debug("Setting message seen attribute to {} in message {} from folder {}", seen, messageId, folderId);
        imapServiceFactory.getObject().setMessagesSeen(
                credentialsService.fromRequest(request), Folder.toId(folderId), seen, messageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "/{folderId}/messages/seen/{seen}")
    public ResponseEntity<Void> setMessagesSeen(
            HttpServletRequest request, @PathVariable("folderId") String folderId,
            @PathVariable("seen") Boolean seen, @RequestBody List<Long> messageIds) {

        log.debug("Setting {} messages in folder {} seen attribute to {}" , messageIds.size(), folderId, seen);
        imapServiceFactory.getObject().setMessagesSeen(
                credentialsService.fromRequest(request), Folder.toId(folderId), seen,
                messageIds.stream().mapToLong(Long::longValue).toArray());
        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/flagged")
    public ResponseEntity<Void> setMessageFlagged(
            HttpServletRequest request, @PathVariable("folderId") String folderId,
            @PathVariable("messageId") Long messageId, @RequestBody boolean flagged) {

        log.debug("Setting message flagged attribute to {} in message {} from folder {}", flagged, messageId, folderId);
        imapServiceFactory.getObject().setMessagesFlagged(
                credentialsService.fromRequest(request), Folder.toId(folderId), flagged, messageId);
        return ResponseEntity.noContent().build();
    }

    private static Folder[] addLinks(Folder... folders) {
        Stream.of(folders).forEach(FolderResource::addLinks);
        return folders;
    }

    private static List<Folder> addLinks(List<Folder> folders) {
        folders.forEach(FolderResource::addLinks);
        return folders;
    }

    private static Folder addLinks(Folder folder) {
        folder.add(linkTo(methodOn(FolderResource.class)
                .getMessages( folder.getFolderId(), null, null))
                .withRel(REL_MESSAGES).expand());
        folder.add(linkTo(methodOn(FolderResource.class)
                .renameFolder(null, folder.getFolderId(), null))
                .withRel(REL_RENAME));
        folder.add(linkTo(methodOn(FolderResource.class)
                .moveFolder(null, folder.getFolderId(), null))
                .withRel(REL_MOVE));
        folder.add(linkTo(methodOn(FolderResource.class)
                .getMessage(null, folder.getFolderId(), null))
                .withRel(REL_MESSAGE));
        folder.add(linkTo(methodOn(FolderResource.class)
                .setMessageFlagged(null, folder.getFolderId(), null, false))
                .withRel(REL_MESSAGE_FLAGGED));
        folder.add(linkTo(methodOn(FolderResource.class)
                .moveMessage(null, folder.getFolderId(), null, null))
                .withRel(REL_MESSAGE_MOVE));
        folder.add(linkTo(methodOn(FolderResource.class)
                .moveMessages(null, folder.getFolderId(), null, Collections.emptyList()))
                .withRel(REL_MESSAGE_MOVE_BULK));
        folder.add(linkTo(methodOn(FolderResource.class)
                .setMessageSeen(null, folder.getFolderId(), null, false))
                .withRel(REL_MESSAGE_SEEN));
        folder.add(linkTo(methodOn(FolderResource.class)
                .setMessagesSeen(null, folder.getFolderId(), null, Collections.emptyList()))
                .withRel(REL_MESSAGE_SEEN_BULK));
        addLinks(folder.getChildren());
        return folder;
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
            attachment.add(linkTo(methodOn(FolderResource.class).getAttachment(null, folderId, message.getUid(),
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
