/*
 * AuthenticationException.java
 *
 * Created on 2018-08-18, 7:47
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
