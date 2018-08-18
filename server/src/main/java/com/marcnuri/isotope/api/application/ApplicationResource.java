/*
 * ApplicationResource.java
 *
 * Created on 2018-08-15, 18:09
 */
package com.marcnuri.isotope.api.application;

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.imap.ImapService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@RestController
@RequestMapping(path = "/v1/application")
public class ApplicationResource {

    private static final Logger log = LoggerFactory.getLogger(ApplicationResource.class);

    private final ImapService imapService;

    @Autowired
    public ApplicationResource(ImapService imapService) {
        this.imapService = imapService;
    }

    @RequestMapping(path = "/login", method = POST, produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Credentials> login(
            @Validated(Credentials.Login.class) @RequestBody Credentials credentials) {

        return ResponseEntity.ok(imapService.checkCredentials(credentials));
    }

}
