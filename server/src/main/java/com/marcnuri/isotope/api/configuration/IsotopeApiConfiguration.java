/*
 * Configuration.java
 *
 * Created on 2018-08-08, 16:35
 */
package com.marcnuri.isotope.api.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Configuration
@ComponentScan("com.marcnuri.isotope.api")
@EnableConfigurationProperties(ServerProperties.class)
@Import({WebConfiguration.class})
public class IsotopeApiConfiguration {

    private static final String IMAP_SERVER = "IMAP_SERVER";
    private static final String IMAP_PORT = "IMAP_PORT";
    private static final String IMAP_USER = "IMAP_USER";
    private static final String IMAP_PASSWORD = "IMAP_PASSWORD";

    private final Environment environment;

    @Autowired
    public IsotopeApiConfiguration(Environment environment) {
        this.environment = environment;
    }

    @Deprecated
    public String getImapHost() {
        return environment.getProperty(IMAP_SERVER);
    }

    @Deprecated
    public Integer getImapPort() {
        return environment.getProperty(IMAP_PORT, Integer.class);
    }

    @Deprecated
    public String getImapUser() {
        return environment.getProperty(IMAP_USER);
    }

    @Deprecated
    public String getImapPassword() {
        return environment.getProperty(IMAP_PASSWORD);
    }
}
