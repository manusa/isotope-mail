/*
 * SmtpResource.java
 *
 * Created on 2018-10-07, 20:12
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
package com.marcnuri.isotope.api.smtp;

import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.message.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-10-07.
 */
@RestController
@RequestMapping(path = "/v1/smtp")
public class SmtpResource {

    private static final Logger log = LoggerFactory.getLogger(SmtpResource.class);

    private final CredentialsService credentialsService;
    private final ObjectFactory<SmtpService> smtpServiceFactory;

    @Autowired
    public SmtpResource(CredentialsService credentialsService, ObjectFactory<SmtpService> smtpServiceFactory) {
        this.credentialsService = credentialsService;
        this.smtpServiceFactory = smtpServiceFactory;
    }

    @PostMapping
    public ResponseEntity<Void> sendMessage(
            HttpServletRequest request, @Validated({Message.SmtpSend.class}) @RequestBody Message message) {

        log.debug("Sending SMTP message");
        smtpServiceFactory.getObject().sendMessage(request, credentialsService.fromRequest(request), message);
        return ResponseEntity.noContent().build();
    }

}
