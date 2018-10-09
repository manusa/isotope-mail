/*
 * IsotopeException.java
 *
 * Created on 2018-08-08, 17:19
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

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static com.marcnuri.isotope.api.http.HttpHeaders.ISOTOPE_EXCEPTION;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
public class IsotopeException extends RuntimeException {

    private static final int MISCELLANEOUS_HTTP_WARN_CODE = 199;
    private static final int MAX_HEADER_LENGTH = 500;

    private final HttpStatus httpStatus;

    public IsotopeException() {
        this(null);
    }

    public IsotopeException(String message) {
        this(HttpStatus.BAD_REQUEST, message, null);
    }

    public IsotopeException(HttpStatus httpStatus, String message) {
        this(httpStatus, message, null);
    }

    public IsotopeException(String message, Throwable cause) {
        this(HttpStatus.BAD_REQUEST, message, cause);
    }

    public IsotopeException(HttpStatus httpStatus, String message,  Throwable cause) {
        super(message, cause);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public final ResponseEntity<String> toFrontEndResponseEntity() {
        final String message = getMessage();
        final HttpHeaders headers = new HttpHeaders();
        headers.set(ISOTOPE_EXCEPTION, getClass().getName());
        headers.set(HttpHeaders.WARNING, String.format("%s %s \"%s\"",
                MISCELLANEOUS_HTTP_WARN_CODE, "-",
                message == null ? "" :
                        message.substring(0, Math.min(message.length(), MAX_HEADER_LENGTH))
                                .replaceAll("[\\n\\r]", "")));
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>(message, headers, getHttpStatus());
    }

}
