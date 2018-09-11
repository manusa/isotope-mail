/*
 * FolderResource.java
 *
 * Created on 2018-08-08, 16:32
 */
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.message.Message;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@RestController
@RequestMapping(path = "/v1/folders")
public class FolderResource {

    private static final String REL_MESSAGES = "messages";

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

        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject()
                .getFolders(credentialsService.fromRequest(request), loadChildren)));
    }

    @GetMapping(path = "/{folderId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            HttpServletRequest request,
            @PathVariable("folderId") String folderId, @RequestParam(value = "start", required = false) Integer start,
            @RequestParam(value = "end", required = false) Integer end) {

        return ResponseEntity.ok(addLinks(folderId, imapServiceFactory.getObject()
                .getMessages(credentialsService.fromRequest(request), Folder.toId(folderId), start, end)));
    }

    @GetMapping(path = "/{folderId}/messages/{messageId}")
    public ResponseEntity<Message> getMessage(
            HttpServletRequest request, @PathVariable("folderId") String folderId, @PathVariable("messageId") Long messageId) {

        return ResponseEntity.ok(addLinks(folderId, imapServiceFactory.getObject()
                .getMessage(credentialsService.fromRequest(request), Folder.toId(folderId), messageId)));
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

    private static Message[] addLinks(String folderId, Message... messages) {
        Stream.of(messages).forEach(m -> addLinks(folderId, m));
        return messages;
    }

    private static List<Message> addLinks(String folderId, List<Message> messages) {
        messages.forEach(m -> addLinks(folderId, m));
        return messages;
    }

    private static Message addLinks(String folderId, Message message) {
        message.add(linkTo(methodOn(FolderResource.class).getMessage(null, folderId, message.getUid()))
                .withSelfRel().expand());
        return message;
    }
}
