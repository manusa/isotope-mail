/*
 * Configuration.java
 *
 * Created on 2018-08-08, 16:35
 */
package com.marcnuri.mailclient.api.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Configuration
@EnableWebMvc
@ComponentScan("com.marcnuri.mailclient.api")
@EnableConfigurationProperties(ServerProperties.class)
public class MailClientApiConfiguration {

    private static final String IMAP_SERVER = "IMAP_SERVER";
    private static final String IMAP_PORT = "IMAP_PORT";
    private static final String IMAP_USER = "IMAP_USER";
    private static final String IMAP_PASSWORD = "IMAP_PASSWORD";

    private final Environment environment;

    @Autowired
    public MailClientApiConfiguration(Environment environment) {
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
