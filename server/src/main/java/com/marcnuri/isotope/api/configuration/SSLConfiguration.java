/*
 * SSLConfiguration.java
 *
 * Created on 2018-10-10, 18:52
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

import com.sun.mail.util.MailSSLSocketFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.GeneralSecurityException;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-10-10.
 */
@Configuration
public class SSLConfiguration {

    @Bean
    public MailSSLSocketFactory mailSSLSocketFactory() throws GeneralSecurityException {
        final MailSSLSocketFactory ret =  new MailSSLSocketFactory();
        ret.setTrustAllHosts(true);
        return ret;
    }
}
