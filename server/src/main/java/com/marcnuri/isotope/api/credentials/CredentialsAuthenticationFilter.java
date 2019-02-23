/*
 * CredentialsAuthenticationFilter.java
 *
 * Created on 2019-02-23, 7:47
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-23.
 */
public class CredentialsAuthenticationFilter extends GenericFilterBean {

    private static final Logger log = LoggerFactory.getLogger(CredentialsAuthenticationFilter.class);

    private final CredentialsService credentialsService;
    private final RequestMatcher requestMatcher;

    public CredentialsAuthenticationFilter(RequestMatcher requestMatcher, CredentialsService credentialsService) {
        this.requestMatcher = requestMatcher;
        this.credentialsService = credentialsService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        final HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        final HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        if (!requestMatcher.matches(httpServletRequest) || authenticate(httpServletRequest)) {
            chain.doFilter(request, response);
        } else {
            httpServletResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
            httpServletResponse.setContentType("text/html");
            httpServletResponse.getWriter().write("Unauthorized\n");
            httpServletResponse.getWriter().close();
            httpServletResponse.flushBuffer();
        }
    }

    private boolean authenticate(HttpServletRequest httpServletRequest) {
        try {
            final Credentials credentials = credentialsService.fromRequest(httpServletRequest);
            SecurityContextHolder.getContext().setAuthentication(credentials);
            return true;
        } catch (Exception ex) {
            log.info("Couldn't authenticate request");
        }
        return false;
    }

}
