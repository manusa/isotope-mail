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
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
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
public class FolderResource implements ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(FolderResource.class);

    private static final String REL_MESSAGES = "messages";
    private static final String REL_DOWNLOAD = "download";
    private static final String REL_RENAME = "rename";
    private static final String REL_MOVE = "move";
    private static final String REL_MOVE_BULK = "move.bulk";
    private static final String REL_SEEN = "seen";
    private static final String REL_SEEN_BULK = "seen.bulk";

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
            HttpServletRequest request, @PathVariable("folderId") String folderId, @RequestBody String newName) {
        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject().renameFolder(
                credentialsService.fromRequest(request), Folder.toId(folderId), newName
        )));
    }

    @GetMapping(path = "/{folderId}/messages", produces = TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<List<Message>>> getMessages(
            @PathVariable("folderId") String folderId, HttpServletRequest request, HttpServletResponse response) {

        log.debug("Loading list of messages for folder {} ", folderId);
        // Publishing occurs in separate Thread, store request data in this thread (needed by HATEOAS) -> lambda setRequestAttributes
        final RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        return applicationContext.getBean(IMAP_SERVICE_PROTOTYPE, ImapService.class)
                .getMessagesFlux(credentialsService.fromRequest(request), Folder.toId(folderId), response)
                .map(l -> {
                    RequestContextHolder.setRequestAttributes(requestAttributes);
                    addLinks(folderId, l.data());
                    return l;
                })
                .subscribeOn(Schedulers.elastic())
                .publishOn(Schedulers.immediate()) // Will allow server to stop sending events in case client disconnects
                ;
    }

    @GetMapping(path = "/{folderId}/messages")
    public ResponseEntity<List<Message>> preloadMessages(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @RequestParam("id") List<Long> messageIds) {

        log.debug("Preloading {} messages for folder {} ", messageIds.size(), folderId);
        final List<Message> ret = imapServiceFactory.getObject()
                .preloadMessages(credentialsService.fromRequest(request), Folder.toId(folderId), messageIds);
        addLinks(folderId, ret);
        return ResponseEntity.ok(ret);
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
        addLinks(toFolderId, movedMessages);
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
        addLinks(toFolderId, movedMessages);
        return ResponseEntity.ok(movedMessages);
    }

    @PutMapping(path = "/{folderId}/messages/{messageId}/seen")
    public ResponseEntity<MessageWithFolder> setMessageSeen(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") long messageId,
            @RequestBody boolean seen) {

        log.debug("Setting message seen attribute to {} in message {} from folder {}", seen, messageId, folderId);
        final MessageWithFolder ret = imapServiceFactory.getObject().setMessagesSeen(
                credentialsService.fromRequest(request), Folder.toId(folderId), seen, messageId).stream()
                .findFirst().orElse(null);
        if (ret != null) {
            addLinks(ret.getFolder());
            addLinks(folderId, ret);
        }
        return ResponseEntity.ok(ret);
    }

    @PutMapping(path = "/{folderId}/messages/seen/{seen}")
    public ResponseEntity<List<MessageWithFolder>> setMessagesSeen(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("seen") Boolean seen,
            @NonNull @RequestBody List<Long> messageIds) {

        log.debug("Setting {} messages in folder {} seen attribute to {}" , messageIds.size(), folderId, seen);
        final List<MessageWithFolder> ret = imapServiceFactory.getObject().setMessagesSeen(
                credentialsService.fromRequest(request), Folder.toId(folderId), seen,
                messageIds.stream().mapToLong(Long::longValue).toArray());
        ret.forEach(mwf -> addLinks(mwf.getFolder()));
        addLinks(folderId, ret);
        return ResponseEntity.ok(ret);
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
        addLinks(folder.getChildren());
        return folder;
    }

    private static <M extends Message> M[] addLinks(String folderId, M... messages) {
        Stream.of(messages).forEach(m -> addLinks(folderId, m));
        return messages;
    }

    private static <M extends Message> List<M> addLinks(String folderId, List<M> messages) {
        messages.forEach(m -> addLinks(folderId, m));
        return messages;
    }

    private static <M extends Message> M addLinks(String folderId, @Nullable M message) {
        if (message != null) {
            message.add(linkTo(methodOn(FolderResource.class).getMessage(null, folderId, message.getUid()))
                    .withSelfRel().expand());
            message.add(linkTo(methodOn(FolderResource.class).moveMessage(null, folderId, message.getUid(),
                    null)).withRel(REL_MOVE));
            message.add(linkTo(methodOn(FolderResource.class).moveMessages(null, folderId, null,
                    Collections.emptyList())).withRel(REL_MOVE_BULK));
            message.add(linkTo(methodOn(FolderResource.class).setMessageSeen(null, folderId, message.getUid(),
                    false)).withRel(REL_SEEN));
            message.add(linkTo(methodOn(FolderResource.class).setMessagesSeen(null, folderId, null,
                    Collections.emptyList())).withRel(REL_SEEN_BULK));
        }
        return message;
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
    public void setApplicationContext(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

}
