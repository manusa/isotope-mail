/*
 * FolderResource.java
 *
 * Created on 2018-08-08, 16:32
 */
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.imap.ImapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@RestController
@RequestMapping(path = "/v1/folders")
public class FolderResource {

    private final ImapService imapService;

    @Autowired
    public FolderResource(ImapService imapService) {
        this.imapService = imapService;
    }

    @RequestMapping(path = "", method = GET)
    public ResponseEntity<List<Folder>> getFolders() {
        return ResponseEntity.ok(imapService.getFolders());
    }
}
