/*
 * CredentialsRefreshFilterTest.java
 *
 * Created on 2019-02-23, 16:21
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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletResponse;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-23.
 */
public class CredentialsRefreshFilterTest {

    private CredentialsService credentialsService;
    private CredentialsRefreshFilter credentialsRefreshFilter;

    @Before
    public void setUp() {
        credentialsService = Mockito.mock(CredentialsService.class);
        credentialsRefreshFilter = new CredentialsRefreshFilter(credentialsService);
    }

    @After
    public void tearDown() {
        credentialsRefreshFilter = null;
        credentialsService = null;
    }

    @Test
    public void doFilter_authenticatedUser_shouldRefreshCredentials() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        SecurityContextHolder.getContext().setAuthentication(credentials);
        final HttpServletResponse response = new MockHttpServletResponse();
        final FilterChain mockFilterChain = Mockito.mock(FilterChain.class);

        // When
        credentialsRefreshFilter.doFilter(new MockHttpServletRequest(), response, mockFilterChain);

        // Then
        verify(credentialsService, times(1)).refreshCredentials(Mockito.eq(credentials), Mockito.eq(response));
        verify(mockFilterChain, times(1)).doFilter(Mockito.any(ServletRequest.class), Mockito.eq(response));
    }

    @Test
    public void doFilter_unAuthenticatedUser_shouldRefreshCredentials() throws Exception {
        // Given
        SecurityContextHolder.getContext().setAuthentication(null);
        final HttpServletResponse response = new MockHttpServletResponse();
        final FilterChain mockFilterChain = Mockito.mock(FilterChain.class);

        // When
        credentialsRefreshFilter.doFilter(new MockHttpServletRequest(), response, mockFilterChain);

        // Then
        verify(credentialsService, times(0))
                .refreshCredentials(Mockito.any(Credentials.class), Mockito.any(HttpServletResponse.class));
        verify(mockFilterChain, times(1)).doFilter(Mockito.any(ServletRequest.class), Mockito.eq(response));
    }
}
