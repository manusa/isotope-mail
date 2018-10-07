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

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.imap.ImapService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping(path = "/login", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Credentials> login(
            @Validated(Credentials.Login.class) @RequestBody Credentials credentials) {

        log.info("User logging into application");
        return ResponseEntity.ok(imapService.checkCredentials(credentials));
    }

}
