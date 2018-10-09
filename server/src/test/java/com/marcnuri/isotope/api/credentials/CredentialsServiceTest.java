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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.exception.AuthenticationException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.Assert.fail;
import static org.mockito.Mockito.doReturn;

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
}
