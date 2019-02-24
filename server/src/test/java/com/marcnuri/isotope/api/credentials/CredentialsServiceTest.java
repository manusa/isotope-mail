/*
 * CredentialsServiceTest.java
 *
 * Created on 2018-10-07, 19:00
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
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.http.HttpHeaders.ISOTOPE_CREDENTIALS;
import static com.marcnuri.isotope.api.http.HttpHeaders.ISOTOPE_SALT;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-10-07.
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class CredentialsServiceTest {

    private CredentialsService credentialsService;

    @MockBean
    private ObjectMapper objectMapper;
    @MockBean
    private IsotopeApiConfiguration isotopeApiConfiguration;

    @Before
    public void setUp() {
        credentialsService = new CredentialsService(objectMapper, isotopeApiConfiguration);
    }

    @After
    public void tearDown() throws Exception {
        credentialsService = null;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // checkHost
    @Test
    public void checkHost_trustedHost_shouldNotThrowException() {
        // Given
        final String trustedHost = "broken.trust.tom";
        doReturn(Stream.of(trustedHost).collect(Collectors.toSet())).when(isotopeApiConfiguration).getTrustedHosts();
        final Credentials toTest = new Credentials();
        toTest.setServerHost(trustedHost);

        // When
        credentialsService.checkHost(toTest);

        // Then
        // No exception is thrown
    }

    @Test
    public void checkHost_emptyTrustedHostConfiguration_shouldNotThrowException() {
        // Given
        final String trustedHost = "broken.trust.tom";
        doReturn(Collections.emptySet()).when(isotopeApiConfiguration).getTrustedHosts();
        final Credentials toTest = new Credentials();
        toTest.setServerHost("trust.issues.com");

        // When
        credentialsService.checkHost(toTest);

        // Then
        // No exception is thrown
    }

    @Test(expected = AuthenticationException.class)
    public void checkHost_notTrustedHost_shouldThrowException() {
        // Given
        final String trustedHost = "borken.trust.tom";
        doReturn(Stream.of(trustedHost).collect(Collectors.toSet())).when(isotopeApiConfiguration).getTrustedHosts();
        final Credentials toTest = new Credentials();
        toTest.setServerHost("trust.issues.com");

        // When
        credentialsService.checkHost(toTest);

        // Then
        fail("AuthenticationException was expected");
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // refreshCredentials
    @Test
    public void refreshCredentials_validCredentials_shouldWriteResponseHeaders() throws Exception {
        // Given
        doReturn(Duration.ofMillis(1337L)).when(isotopeApiConfiguration).getCredentialsDuration();
        doReturn("I'M SECRET").when(isotopeApiConfiguration).getEncryptionPassword();
        doReturn("{}").when(objectMapper).writeValueAsString(Mockito.any(Credentials.class));
        final HttpServletResponse response = new MockHttpServletResponse();
        final Credentials credentials = new Credentials();

        // When
        credentialsService.refreshCredentials(credentials, response);

        // Then
        assertThat(response.getHeader(ISOTOPE_CREDENTIALS), not(emptyOrNullString()));
        assertThat(response.getHeader(ISOTOPE_SALT), not(emptyOrNullString()));
    }

    @Test
    public void refreshCredentials_invalidCredentials_shouldNotWriteResponseHeaders() throws Exception {
        // Given
        doReturn(Duration.ofMillis(1337L)).when(isotopeApiConfiguration).getCredentialsDuration();
        doReturn("I'M SECRET").when(isotopeApiConfiguration).getEncryptionPassword();
        doThrow(JsonProcessingException.class).when(objectMapper).writeValueAsString(Mockito.any(Credentials.class));
        final HttpServletResponse response = new MockHttpServletResponse();
        final Credentials credentials = new Credentials();

        // When
        credentialsService.refreshCredentials(credentials, response);

        // Then
        assertThat(response.getHeader(ISOTOPE_CREDENTIALS), emptyOrNullString());
        assertThat(response.getHeader(ISOTOPE_SALT), emptyOrNullString());
    }
}
