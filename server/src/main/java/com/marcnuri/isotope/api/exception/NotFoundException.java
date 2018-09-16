/*
 * NotFoundException.java
 *
 * Created on 2018-09-15, 18:01
 */
package com.marcnuri.isotope.api.exception;

import org.springframework.http.HttpStatus;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-15.
 */
public class NotFoundException extends IsotopeException {

    public NotFoundException(String message) {
        this(message, null);
    }

    public NotFoundException(String message, Throwable cause) {
        super(HttpStatus.NOT_FOUND, message, cause);
    }
}
