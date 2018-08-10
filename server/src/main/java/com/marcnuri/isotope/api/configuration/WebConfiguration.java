/*
 * WebConfiguration.java
 *
 * Created on 2018-08-09, 7:55
 */
package com.marcnuri.isotope.api.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-09.
 */
@Configuration
@EnableWebMvc
public class WebConfiguration implements WebMvcConfigurer {

    private static final String DEVELOPMENT_PROFILE = "dev";

    private final Environment environment;

    @Autowired
    public WebConfiguration(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (Stream.of(this.environment.getActiveProfiles()).anyMatch(DEVELOPMENT_PROFILE::equals)) {
            registry.addMapping("/v1/**");
        }
    }
}
