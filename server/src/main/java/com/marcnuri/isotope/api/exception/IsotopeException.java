/*
 * IsotopeException.java
 *
 * Created on 2018-08-08, 17:19
 */
package com.marcnuri.isotope.api.exception;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
public class IsotopeException extends RuntimeException {

    public IsotopeException() {
        this(null);
    }

    public IsotopeException(String message) {
        super(message);
    }
}
