/*
 * WebConfiguration.java
 *
 * Created on 2018-08-09, 7:55
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

    @Bean(name = "prototypeImapService")
    @Scope(SCOPE_PROTOTYPE)
    @Qualifier("prototypeImapService")
    public ImapService imapService(IsotopeApiConfiguration isotopeApiConfiguration, CredentialsService credentialsService) {
        return new ImapService(isotopeApiConfiguration, credentialsService);
    }
}
