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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Set;

import static com.marcnuri.isotope.api.exception.AuthenticationException.Type.BLACKLISTED;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@Service
public class CredentialsService {

    private static final Logger log = LoggerFactory.getLogger(CredentialsService.class);

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
    Credentials fromRequest(HttpServletRequest httpServletRequest) {
        try {
            final String encryptedCredentials = httpServletRequest.getHeader(HttpHeaders.ISOTOPE_CREDENTIALS);
            final String salt = httpServletRequest.getHeader(HttpHeaders.ISOTOPE_SALT);
            if (StringUtils.isEmpty(encryptedCredentials) || StringUtils.isEmpty(salt)) {
                throw new AuthenticationException("Isotope credentials headers missing");
            }
            final Credentials credentials =  decrypt(encryptedCredentials,salt);
            if (credentials.getExpiryDate().compareTo(ZonedDateTime.now(ZoneOffset.UTC)) < 0) {
                throw new AuthenticationException("Expired credentials");
            }
            credentials.setAuthenticated(true);
            return credentials;
        } catch(IOException ex) {
            throw new AuthenticationException("Invalid credentials", ex);
        }
    }

    /**
     * Refreshes Credentials expiry date and writes new values to the provided {@link HttpServletResponse} Headers
     *
     * @param oldCredentials with "outdated" expiry date
     * @param response to which to write new encrypted credentials headers
     */
    void refreshCredentials(Credentials oldCredentials, HttpServletResponse response) {
        try {
            final Credentials newCredentials = encrypt(oldCredentials);
            response.setHeader(HttpHeaders.ISOTOPE_CREDENTIALS, newCredentials.getEncrypted());
            response.setHeader(HttpHeaders.ISOTOPE_SALT, newCredentials.getSalt());
        } catch(JsonProcessingException ex) {
            log.info("Couldn't refresh credentials", ex);
        }
    }

    public Credentials encrypt(Credentials credentials) throws JsonProcessingException {
        final Credentials encrytpedCredentials = new Credentials();
        // Add expiry date
        credentials.setExpiryDate(ZonedDateTime.now(ZoneOffset.UTC).plus(isotopeApiConfiguration.getCredentialsDuration()));
        // Perform encryption
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
