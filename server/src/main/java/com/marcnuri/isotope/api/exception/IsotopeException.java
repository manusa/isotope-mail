/*
 * IsotopeException.java
 *
 * Created on 2018-08-08, 17:19
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
        final HttpHeaders headers = new HttpHeaders();
        headers.set(ISOTOPE_EXCEPTION, getClass().getName());
        headers.set(HttpHeaders.WARNING, String.format("%s %s \"%s\"",
                MISCELLANEOUS_HTTP_WARN_CODE, "-", getMessage() == null ? "" : getMessage()));
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>(getMessage(), headers, getHttpStatus());
    }

}
