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

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Configuration
@ComponentScan("com.marcnuri.isotope.api")
@EnableConfigurationProperties(ServerProperties.class)
@Import({WebConfiguration.class})
public class IsotopeApiConfiguration {

    @SuppressWarnings("squid:S2068")
    private static final String ENCRYPTION_PASSWORD = "ENCRYPTION_PASSWORD";
    @SuppressWarnings("squid:S2068")
    private static final String ENCRYPTION_PASSWORD_DEFAULT = "THIS IS THE ENCRYPTION PASSWORD DEFAULT " +
            "IN ORDER TO HAVE REAL SECURITY IT SHOULD BE REPLACED USING 'ENCRYPTION_PASSWORD' ENVIRONMENT VARIABLE";

    private static final String TRUSTED_HOSTS = "TRUSTED_HOSTS";

    private static final String EMBEDDED_IMAGE_SIZE_THRESHOLD = "EMBEDDED_IMAGE_SIZE_THRESHOLD";
    private static final long EMBEDDED_IMAGE_SIZE_THRESHOLD_DEFAULT_50KB = 51200L;

    private final Environment environment;

    @Autowired
    public IsotopeApiConfiguration(Environment environment) {
        this.environment = environment;
    }

    /**
     * Retrieves the encryption password from the <code>ENCRYPTION_PASSWORD</code> environment variable.
     *
     * If no password was specified in an environment variable ENCRYPTION_PASSWORD_DEFAULT will be used by default.
     *
     * @return
     */
    public String getEncryptionPassword() {
        return environment.getProperty(ENCRYPTION_PASSWORD, ENCRYPTION_PASSWORD_DEFAULT);
    }

    public Set<String> getTrustedHosts() {
        final String trustedHosts = environment.getProperty(TRUSTED_HOSTS, "");
        return trustedHosts.isEmpty() ? Collections.emptySet() :
                Stream.of(trustedHosts.split("\\,")).map(String::trim).collect(Collectors.toSet());
    }

    public long getEmbeddedImageSizeThreshold() {
        return environment.getProperty(EMBEDDED_IMAGE_SIZE_THRESHOLD, Long.class, EMBEDDED_IMAGE_SIZE_THRESHOLD_DEFAULT_50KB);
    }

}
