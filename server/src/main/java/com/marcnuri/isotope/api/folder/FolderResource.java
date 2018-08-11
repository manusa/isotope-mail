/*
 * FolderResource.java
 *
 * Created on 2018-08-08, 16:32
 */
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.message.Message;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    private final ObjectFactory<ImapService> imapServiceFactory;

    @Autowired
    public FolderResource(ObjectFactory<ImapService> imapServiceFactory) {
        this.imapServiceFactory = imapServiceFactory;
    }

    @RequestMapping(path = "", method = GET, produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<List<Folder>> getFolders() {
        return ResponseEntity.ok(addLinks(imapServiceFactory.getObject().getFolders()));
    }

    @RequestMapping(path = "/INBOX/messages", method = GET)
    public ResponseEntity<List<Message>> getInboxMessages() {
        return ResponseEntity.ok(imapServiceFactory.getObject().getMessages("INBOX"));
    }

    @RequestMapping(path = "/{folderId}/messages", method = GET)
    public ResponseEntity<List<Message>> getMessages(@PathVariable("folderId") String folderId) {
        return ResponseEntity.ok(imapServiceFactory.getObject().getMessages(Folder.toId(folderId)));
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
        folder.add(linkTo(methodOn(FolderResource.class).getMessages(folder.getFolderId())).withRel(REL_MESSAGES));
        addLinks(folder.getChildren());
        return folder;
    }
}
