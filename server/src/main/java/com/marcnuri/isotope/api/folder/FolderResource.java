/*
 * FolderResource.java
 *
 * Created on 2018-08-08, 16:32
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
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@RestController
@RequestMapping(path = "/v1/folders")
public class FolderResource {

    private static final Logger log = LoggerFactory.getLogger(FolderResource.class);

    private static final String REL_MESSAGES = "messages";
    private static final String REL_DOWNLOAD = "download";
    private static final String REL_MOVE = "move";

    private final CredentialsService credentialsService;
    private final ObjectFactory<ImapService> imapServiceFactory;

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

    @GetMapping(path = "/{folderId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            HttpServletRequest request,
            @PathVariable("folderId") String folderId, @RequestParam(value = "start", required = false) Integer start,
            @RequestParam(value = "end", required = false) Integer end) {

        log.debug("Loading list of messages for folder {} [Range: {}-{}]", folderId, start, end);
        return ResponseEntity.ok(addLinks(folderId, imapServiceFactory.getObject()
                .getMessages(credentialsService.fromRequest(request), Folder.toId(folderId), start, end)));
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}")
    public ResponseEntity<Message> getMessage(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId) {

        log.debug("Loading message {} from folder {}", messageId, folderId);
        return ResponseEntity.ok(addLinks(folderId, imapServiceFactory.getObject()
                .getMessage(credentialsService.fromRequest(request), Folder.toId(folderId), messageId)));
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

    @PutMapping(path = "/{fromFolderId}/messages/{messageId}/folder/{toFolderId}")
    public ResponseEntity<List<MessageWithFolder>> moveMessage(
            HttpServletRequest request, @PathVariable("fromFolderId") String fromFolderId,
            @PathVariable("messageId") Long messageId, @PathVariable("toFolderId") String toFolderId) {

        log.debug("Moving message {} from folder {} to folder {}", messageId, fromFolderId, toFolderId);
        final List<MessageWithFolder> movedMessages = imapServiceFactory.getObject().moveMessages(
                credentialsService.fromRequest(request), Folder.toId(fromFolderId), Folder.toId(toFolderId),
                Arrays.asList(messageId));
        movedMessages.forEach(mwf -> addLinks(mwf.getFolder()));
        addLinks(toFolderId, movedMessages);
        return ResponseEntity.ok(movedMessages);
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
                .getMessages(null, folder.getFolderId(), null, null))
                .withRel(REL_MESSAGES).expand());
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

    private static <M extends Message> M addLinks(String folderId, M message) {
        message.add(linkTo(methodOn(FolderResource.class).getMessage(null, folderId, message.getUid()))
                .withSelfRel().expand());
        message.add(linkTo(methodOn(FolderResource.class).moveMessage(null, folderId, message.getUid(),
                null)).withRel(REL_MOVE));
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
        attachment.add(linkTo(methodOn(FolderResource.class).getAttachment(null, folderId, message.getUid(),
                isContentId ? attachment.getContentId() : attachment.getFileName(), isContentId, null))
                .withRel(REL_DOWNLOAD).expand());
        return attachment;
    }
}
