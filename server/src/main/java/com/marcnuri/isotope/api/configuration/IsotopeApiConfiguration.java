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

    private static final String ENCRYPTION_PASSWORD = "ENCRYPTION_PASSWORD";
    private static final String ENCRYPTION_PASSWORD_DEFAULT = "THIS IS THE ENCRYPTION PASSWORD DEFAULT " +
            "IN ORDER TO HAVE REAL SECURITY IT SHOULD BE REPLACED USING 'ENCRYPTION_PASSWORD' ENVIRONMENT VARIABLE";

    private final Environment environment;

    @Autowired
    public IsotopeApiConfiguration(Environment environment) {
        this.environment = environment;
    }

    public String getEncryptionPassword() {
        return environment.getProperty(ENCRYPTION_PASSWORD, ENCRYPTION_PASSWORD_DEFAULT);
    }

}
