/*
 * WebConfiguration.java
 *
 * Created on 2018-08-09, 7:55
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

import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.imap.ImapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.stream.Stream;

import static org.springframework.beans.factory.config.BeanDefinition.SCOPE_PROTOTYPE;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-09.
 */
@Configuration
@EnableWebSecurity
@EnableWebFlux
public class WebConfiguration extends WebSecurityConfigurerAdapter implements WebMvcConfigurer, AsyncConfigurer {

    public static final String IMAP_SERVICE_PROTOTYPE = "prototypeImapService";
    private static final String DEVELOPMENT_PROFILE = "dev";

    private Environment environment;

    @Autowired
    public WebConfiguration(Environment environment) {
        this.environment = environment;
    }


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeRequests()
                .regexMatchers("/v1/*").permitAll().and()
                .cors().and()
                .logout().permitAll();
    }

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setTaskExecutor(getAsyncExecutor());
    }

     @Override
     public ThreadPoolTaskExecutor getAsyncExecutor() {
         ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
         executor.setCorePoolSize(7);
         executor.setMaxPoolSize(42);
         executor.setQueueCapacity(11);
         executor.setThreadNamePrefix("MyExecutor-");
         executor.initialize();
         return executor;
     }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final UrlBasedCorsConfigurationSource corsConfigurationSource = new UrlBasedCorsConfigurationSource();
        if (Stream.of(this.environment.getActiveProfiles()).anyMatch(DEVELOPMENT_PROFILE::equals)) {
            corsConfigurationSource.registerCorsConfiguration("/v1/**",
                    new CorsConfiguration().applyPermitDefaultValues());
        }
        return corsConfigurationSource;
    }

    @Bean(name = IMAP_SERVICE_PROTOTYPE)
    @Scope(SCOPE_PROTOTYPE)
    @Qualifier(IMAP_SERVICE_PROTOTYPE)
    public ImapService imapService(IsotopeApiConfiguration isotopeApiConfiguration, CredentialsService credentialsService) {
        return new ImapService(isotopeApiConfiguration, credentialsService);
    }
}
