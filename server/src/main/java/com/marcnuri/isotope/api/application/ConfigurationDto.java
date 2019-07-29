/*
 * ConfigurationDto.java
 *
 * Created on 2019-04-06, 19:09
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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.marcnuri.isotope.api.resource.IsotopeResource;

import java.io.Serializable;
import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-04-06.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
class ConfigurationDto extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = -1279556906780840837L;

    private String googleAnalyticsTrackingId;

    public String getGoogleAnalyticsTrackingId() {
        return googleAnalyticsTrackingId;
    }

    public void setGoogleAnalyticsTrackingId(String googleAnalyticsTrackingId) {
        this.googleAnalyticsTrackingId = googleAnalyticsTrackingId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        ConfigurationDto that = (ConfigurationDto) o;
        return Objects.equals(googleAnalyticsTrackingId, that.googleAnalyticsTrackingId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), googleAnalyticsTrackingId);
    }
}
