/*
 * ConfigurationDtoTest.java
 *
 * Created on 2019-07-29, 6:58
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
package com.marcnuri.isotope.api.application;

import org.junit.Test;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-07-29.
 */
public class ConfigurationDtoTest {

    @Test
    public void hashCode_sameProperties_shouldBeTrue() {
        // Given
        final ConfigurationDto one = new ConfigurationDto();
        final ConfigurationDto other = new ConfigurationDto();
        for (ConfigurationDto instance : new ConfigurationDto[]{one, other}) {
            instance.setGoogleAnalyticsTrackingId("UA-1337-33");
        }
        // When
        final int hashCodeOne = one.hashCode();
        final int hashCodeOther = other.hashCode();
        // Then
        assertThat(hashCodeOne, is(hashCodeOther));
    }

    @Test
    public void equals_sameProperties_shouldBeTrue() {
        // Given
        final ConfigurationDto one = new ConfigurationDto();
        final ConfigurationDto other = new ConfigurationDto();
        for (ConfigurationDto instance : new ConfigurationDto[]{one, other}) {
            instance.setGoogleAnalyticsTrackingId("UA-1337-33");
        }
        // When
        final boolean result = one.equals(other);
        // Then
        assertThat(result, is(true));
    }

    @Test
    public void equals_differentProperties_shouldBeFalse() {
        // Given
        final ConfigurationDto one = new ConfigurationDto();
        one.setGoogleAnalyticsTrackingId("UA-1337-33");
        final ConfigurationDto other = new ConfigurationDto();
        // When
        final boolean result = one.equals(other);
        // Then
        assertThat(result, is(false));
    }

}
