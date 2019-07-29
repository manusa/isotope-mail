/*
 * IsotopeApiConfigurationTest.java
 *
 * Created on 2019-07-28, 20:34
 *
 * Copyright 2019 Marc Nuri
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

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.core.env.Environment;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-07-28.
 */
public class IsotopeApiConfigurationTest {

    private Environment environment;
    private IsotopeApiConfiguration istotopeApiConfiguration;

    @Before
    public void setUp() {
        environment = Mockito.mock(Environment.class);
        istotopeApiConfiguration = new IsotopeApiConfiguration(environment);
    }

    @Test
    public void getEncryptionPassword_envVariableSet_shouldReturnEnvValue() {
        // Given
        doReturn("1234").when(environment)
                .getProperty(eq("ENCRYPTION_PASSWORD"), anyString());
        // When
        final String result = istotopeApiConfiguration.getEncryptionPassword();
        // Then
        assertThat(result, is("1234"));
    }

    @Test
    public void getGoogleAnalyticsTrackingId_envVariableSet_shouldReturnEnvValue() {
        // Given
        doReturn("UA-1337-33").when(environment).getProperty(eq("GOOGLE_ANALYTICS_TRACKING_ID"));
        // When
        final String result = istotopeApiConfiguration.getGoogleAnalyticsTrackingId();
        // Then
        assertThat(result, is("UA-1337-33"));
    }

}
