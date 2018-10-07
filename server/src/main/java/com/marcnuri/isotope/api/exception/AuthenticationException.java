/*
 * AuthenticationException.java
 *
 * Created on 2018-08-18, 7:47
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
package com.marcnuri.isotope.api.exception;

import org.springframework.http.HttpStatus;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-18.
 */
public class AuthenticationException extends IsotopeException {

    public AuthenticationException(String message) {
        this(message, null);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(HttpStatus.UNAUTHORIZED, message, cause);
    }
}
