/*
 * Recipient.java
 *
 * Created on 2018-08-28, 7:06
 *
 * Copyright 2018 Marc Nuri
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
package com.marcnuri.isotope.api.message;

import java.io.Serializable;
import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-28.
 */
public class Recipient implements Serializable {

    private static final long serialVersionUID = -1389623045340754035L;

    private String type;
    private String address;

    public Recipient(String type, String address) {
        this.type = type;
        this.address = address;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Recipient recipient = (Recipient) o;
        return Objects.equals(type, recipient.type) &&
                Objects.equals(address, recipient.address);
    }

    @Override
    public int hashCode() {

        return Objects.hash(type, address);
    }
}
