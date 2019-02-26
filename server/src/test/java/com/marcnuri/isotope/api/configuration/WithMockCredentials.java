/*
 * Credentials.java
 *
 * Created on 2019-02-25, 07:09
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

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-25.
 */
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockCredentialsSecurityContextFactory.class)
public @interface WithMockCredentials {

    String SERVER_HOST = "localhost";
    int SERVER_PORT = 993;
    String USER = "isotope@localhost";
    String PASSWORD = "P@ssw*rd";
    boolean IMAP_SSL = true;

    String serverHost() default SERVER_HOST;
    int serverPort() default SERVER_PORT;
    String user() default USER;
    String password() default PASSWORD;
    boolean imapSsl() default IMAP_SSL;
    String smtpHost() default "smtp.localhost";
    int smtpPort() default 587;
    boolean smtpSsl() default true;
}
