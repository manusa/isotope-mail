/*
 * SecurityConfiguration.java
 *
 * Created on 2019-02-23, 7:35
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

import com.marcnuri.isotope.api.credentials.CredentialsAuthenticationFilter;
import com.marcnuri.isotope.api.credentials.CredentialsRefreshFilter;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-23.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final String LOGIN_REGEX = ".*v1/application/login";
    private final CredentialsService credentialsService;

    @Autowired
    public SecurityConfiguration(CredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf().disable()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    .and()
                .authorizeRequests()
                    .regexMatchers(LOGIN_REGEX).permitAll()
                    .anyRequest().authenticated()
                    .and()
                .cors()
                    .and()
                .logout()
                    .permitAll()
                    .and()
                .addFilterAfter(new CredentialsAuthenticationFilter(
                        new NegatedRequestMatcher(new RegexRequestMatcher(LOGIN_REGEX, "POST")),
                        credentialsService), BasicAuthenticationFilter.class)
                .addFilterAfter(new CredentialsRefreshFilter(credentialsService), CredentialsAuthenticationFilter.class);
    }
}
