/*
 * WebConfiguration.java
 *
 * Created on 2018-08-09, 7:55
 */
package com.marcnuri.isotope.api.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-09.
 */
@Configuration
@EnableWebSecurity
public class WebConfiguration extends WebSecurityConfigurerAdapter implements WebMvcConfigurer {

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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final UrlBasedCorsConfigurationSource corsConfigurationSource = new UrlBasedCorsConfigurationSource();
        if (Stream.of(this.environment.getActiveProfiles()).anyMatch(DEVELOPMENT_PROFILE::equals)) {
            corsConfigurationSource.registerCorsConfiguration("/v1/**",
                    new CorsConfiguration().applyPermitDefaultValues());
        }
        return corsConfigurationSource;
    }
}
