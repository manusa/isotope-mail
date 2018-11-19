/*
 * CredentialsService.java
 *
 * Created on 2018-08-15, 21:46
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
package com.marcnuri.isotope.api.credentials;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.exception.AuthenticationException;
import com.marcnuri.isotope.api.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Set;

import static com.marcnuri.isotope.api.exception.AuthenticationException.Type.BLACKLISTED;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@Service
public class CredentialsService {

    private final ObjectMapper objectMapper;
    private final IsotopeApiConfiguration isotopeApiConfiguration;

    @Autowired
    public CredentialsService(ObjectMapper objectMapper, IsotopeApiConfiguration isotopeApiConfiguration) {
        this.objectMapper = objectMapper;
        this.isotopeApiConfiguration = isotopeApiConfiguration;
    }

    public void checkHost(Credentials credentials) {
        final Set<String> trustedHosts = isotopeApiConfiguration.getTrustedHosts();
        if (!trustedHosts.isEmpty() && !trustedHosts.contains(credentials.getServerHost())){
            throw new AuthenticationException(BLACKLISTED);
        }
    }

    /**
     * Parses {@link HttpServletRequest} for isotope credentials to decode them and return
     * a valid {@link Credentials} object.
     *
     * @param httpServletRequest
     * @return
     */
    public  Credentials fromRequest(HttpServletRequest httpServletRequest) {
        try {
            return decrypt(httpServletRequest.getHeader(HttpHeaders.ISOTOPE_CRDENTIALS),
                    httpServletRequest.getHeader(HttpHeaders.ISOTOPE_SALT));
        } catch(IOException ex) {
            throw new AuthenticationException("Invalid credentials", ex);
        }
    }

    public Credentials encrypt(Credentials credentials) throws JsonProcessingException {
        final Credentials encrytpedCredentials = new Credentials();
        encrytpedCredentials.setSalt(KeyGenerators.string().generateKey());
        final TextEncryptor encryptor = Encryptors.text(isotopeApiConfiguration.getEncryptionPassword(),
                encrytpedCredentials.getSalt());
        encrytpedCredentials.setEncrypted(encryptor.encrypt(objectMapper.writeValueAsString(credentials)));
        return encrytpedCredentials;
    }

    private Credentials decrypt(String encrypted, String salt) throws IOException {
        if(encrypted == null || encrypted.isEmpty() || salt == null || salt.isEmpty()) {
            throw new AuthenticationException("Missing encrypted credentials");
        }
        try {
            final TextEncryptor encryptor = Encryptors.text(isotopeApiConfiguration.getEncryptionPassword(), salt);
            return objectMapper.readValue(encryptor.decrypt(encrypted), Credentials.class);
        } catch(IllegalStateException ex) {
            throw new AuthenticationException("Key or salt is not compatible with encrypted credentials" +
                    " (Server has changed the password or user tampered with credentials.", ex);
        }
    }
}
