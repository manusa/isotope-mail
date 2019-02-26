/*
 * WithMockCredentialsSecurityContextFactory.java
 *
 * Created on 2019-02-25, 7:11
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
package com.marcnuri.isotope.api.configuration;

import com.marcnuri.isotope.api.credentials.Credentials;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.time.Duration;
import java.time.ZonedDateTime;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-25.
 */
public class WithMockCredentialsSecurityContextFactory implements WithSecurityContextFactory<WithMockCredentials> {
    @Override
    public SecurityContext createSecurityContext(WithMockCredentials mockCredentials) {
        final SecurityContext securityContext = SecurityContextHolder.createEmptyContext();

        final Credentials credentials = new Credentials();
        securityContext.setAuthentication(credentials);
        credentials.setServerHost(mockCredentials.serverHost());
        credentials.setServerPort(mockCredentials.serverPort());
        credentials.setUser(mockCredentials.user());
        credentials.setPassword(mockCredentials.password());
        credentials.setImapSsl(mockCredentials.imapSsl());
        credentials.setSmtpHost(mockCredentials.smtpHost());
        credentials.setSmtpPort(mockCredentials.smtpPort());
        credentials.setSmtpSsl(mockCredentials.smtpSsl());
        credentials.setExpiryDate(ZonedDateTime.now().plus(Duration.ofMinutes(15L)));
        return securityContext;
    }
}
