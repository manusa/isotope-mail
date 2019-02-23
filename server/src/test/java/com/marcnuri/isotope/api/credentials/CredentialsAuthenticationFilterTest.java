/*
 * CredentialsAuthenticationFilterTest.java
 *
 * Created on 2019-02-23, 16:40
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

import com.marcnuri.isotope.api.exception.AuthenticationException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.RequestMatcher;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-23.
 */
public class CredentialsAuthenticationFilterTest {

    private RequestMatcher requestMatcher;
    private CredentialsService credentialsService;
    private CredentialsAuthenticationFilter credentialsAuthenticationFilter;

    @Before
    public void setUp() {
        requestMatcher = Mockito.mock(RequestMatcher.class);
        credentialsService = Mockito.mock(CredentialsService.class);
        credentialsAuthenticationFilter = new CredentialsAuthenticationFilter(requestMatcher, credentialsService);
    }

    @After
    public void tearDown() {
        credentialsAuthenticationFilter = null;
        credentialsService = null;
        requestMatcher = null;
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    @Test
    public void doFilter_validRequestAndAuthentication_shouldSetAuthentication() throws Exception {
        // Given
        final HttpServletRequest request = new MockHttpServletRequest();
        final HttpServletResponse response = new MockHttpServletResponse();
        final Credentials credentials = new Credentials();
        doReturn(credentials).when(credentialsService).fromRequest(Mockito.eq(request));
        doReturn(true).when(requestMatcher).matches(Mockito.eq(request));
        final FilterChain mockFilterChain = Mockito.mock(FilterChain.class);

        // When
        credentialsAuthenticationFilter.doFilter(request, response, mockFilterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication(), is(credentials));
        verify(mockFilterChain, times(1)).doFilter(Mockito.eq(request), Mockito.eq(response));
    }

    @Test
    public void doFilter_nonMatchingRequest_shouldNotSetAuthentication() throws Exception {
        // Given
        final HttpServletRequest request = new MockHttpServletRequest();
        final HttpServletResponse response = new MockHttpServletResponse();
        doReturn(false).when(requestMatcher).matches(Mockito.eq(request));
        final FilterChain mockFilterChain = Mockito.mock(FilterChain.class);

        // When
        credentialsAuthenticationFilter.doFilter(request, response, mockFilterChain);

        // Then
        verify(credentialsService, times(0)).fromRequest(Mockito.any());
        verify(mockFilterChain, times(1)).doFilter(Mockito.eq(request), Mockito.eq(response));
    }

    @Test
    public void doFilter_validRequestAndInvalidAuthentication_shouldReturnUnauthorized() throws Exception {
        // Given
        final HttpServletRequest request = new MockHttpServletRequest();
        final HttpServletResponse response = new MockHttpServletResponse();
        final Credentials credentials = new Credentials();
        doThrow(AuthenticationException.class).when(credentialsService).fromRequest(Mockito.eq(request));
        doReturn(true).when(requestMatcher).matches(Mockito.eq(request));
        final FilterChain mockFilterChain = Mockito.mock(FilterChain.class);

        // When
        credentialsAuthenticationFilter.doFilter(request, response, mockFilterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication(), is(nullValue()));
        verify(mockFilterChain, times(0)).doFilter(Mockito.eq(request), Mockito.eq(response));
        assertThat(response.getStatus(), is(401));
    }
}
