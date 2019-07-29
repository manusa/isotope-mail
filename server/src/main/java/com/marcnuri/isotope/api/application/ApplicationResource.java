/*
 * ApplicationResource.java
 *
 * Created on 2018-08-15, 18:09
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
package com.marcnuri.isotope.api.application;

import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.folder.FolderResource;
import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.smtp.SmtpResource;
import com.marcnuri.isotope.api.smtp.SmtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@RestController
@RequestMapping(path = "/v1/application")
public class ApplicationResource {

    private static final Logger log = LoggerFactory.getLogger(ApplicationResource.class);

    private static final String REL_APPLICATION_LOGIN = "application.login";
    private static final String REL_FOLDERS = "folders";
    private static final String REL_FOLDERS_SELF = "folders.self";
    private static final String REL_FOLDERS_MESSAGES = "folders.messages";
    private static final String REL_FOLDERS_DELETE = "folders.delete";
    private static final String REL_FOLDERS_RENAME = "folders.rename";
    private static final String REL_FOLDERS_MOVE = "folders.move";
    private static final String REL_FOLDERS_MESSAGE = "folders.message";
    private static final String REL_FOLDERS_MESSAGE_FLAGGED = "folders.message.flagged";
    private static final String REL_FOLDERS_MESSAGE_MOVE= "folders.message.move";
    private static final String REL_FOLDERS_MESSAGE_MOVE_BULK= "folders.message.move.bulk";
    private static final String REL_FOLDERS_MESSAGE_SEEN = "folders.message.seen";
    private static final String REL_FOLDERS_MESSAGE_SEEN_BULK = "folders.message.seen.bulk";
    private static final String REL_SMTP = "smtp";

    private final IsotopeApiConfiguration configuration;
    private final ImapService imapService;
    private final SmtpService smtpService;

    @Autowired
    public ApplicationResource(IsotopeApiConfiguration configuration, ImapService imapService, SmtpService smtpService) {
        this.configuration = configuration;
        this.imapService = imapService;
        this.smtpService = smtpService;
    }

    @GetMapping(path = "/configuration", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<ConfigurationDto> getConfiguration() {
        log.info("User retrieving application configuration");
        return ResponseEntity.ok(toDto(configuration));
    }

    @PostMapping(path = "/login", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Credentials> login(
            @Validated(Credentials.Login.class) @RequestBody Credentials credentials) {

        log.info("User logging into application");
        final Credentials encryptedCredentials = imapService.checkCredentials(credentials);
        smtpService.checkCredentials(credentials);
        SecurityContextHolder.getContext().setAuthentication(encryptedCredentials);
        return ResponseEntity.ok(encryptedCredentials);
    }

    @SuppressWarnings("ConstantConditions")
    private ConfigurationDto toDto(IsotopeApiConfiguration configuration) {
        final ConfigurationDto ret = new ConfigurationDto();
        ret.setGoogleAnalyticsTrackingId(configuration.getGoogleAnalyticsTrackingId());
        ret.add(linkTo(methodOn(ApplicationResource.class)
                .login(null))
                .withRel(REL_APPLICATION_LOGIN));
        ret.add(linkTo(FolderResource.class)
                .withRel(REL_FOLDERS));
        ret.add(linkTo(methodOn(FolderResource.class)
                .createChildFolder(null, null))
                .withRel(REL_FOLDERS_SELF));
        ret.add(linkTo(methodOn(FolderResource.class)
                .getMessages(null, null))
                .withRel(REL_FOLDERS_MESSAGES));
        ret.add(linkTo(methodOn(FolderResource.class)
                .getMessages(null, null))
                .withRel(REL_FOLDERS_MESSAGES));
        ret.add(linkTo(methodOn(FolderResource.class)
                .deleteFolder(null))
                .withRel(REL_FOLDERS_DELETE));
        ret.add(linkTo(methodOn(FolderResource.class)
                .renameFolder(null, null))
                .withRel(REL_FOLDERS_RENAME));
        ret.add(linkTo(methodOn(FolderResource.class)
                .moveFolder(null, null))
                .withRel(REL_FOLDERS_MOVE));
        ret.add(linkTo(methodOn(FolderResource.class)
                .getMessage(null, null))
                .withRel(REL_FOLDERS_MESSAGE));
        ret.add(linkTo(methodOn(FolderResource.class)
                .setMessageFlagged(null, null, false))
                .withRel(REL_FOLDERS_MESSAGE_FLAGGED));
        ret.add(linkTo(methodOn(FolderResource.class)
                .moveMessage(null, null, null))
                .withRel(REL_FOLDERS_MESSAGE_MOVE));
        ret.add(linkTo(methodOn(FolderResource.class)
                .moveMessages(null, null, Collections.emptyList()))
                .withRel(REL_FOLDERS_MESSAGE_MOVE_BULK));
        ret.add(linkTo(methodOn(FolderResource.class)
                .setMessageSeen(null, null, false))
                .withRel(REL_FOLDERS_MESSAGE_SEEN));
        ret.add(linkTo(methodOn(FolderResource.class)
                .setMessagesSeen(null, null, Collections.emptyList()))
                .withRel(REL_FOLDERS_MESSAGE_SEEN_BULK));
        ret.add(linkTo(methodOn(SmtpResource.class)
                .sendMessage(null, null))
                .withRel(REL_SMTP));
        return ret;
    }

}
