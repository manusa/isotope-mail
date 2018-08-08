/*
 * MailClientException.java
 *
 * Created on 2018-08-08, 17:19
 */
package com.marcnuri.mailclient.api.exception;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
public class MailClientException extends RuntimeException {

    public MailClientException() {
        this(null);
    }

    public MailClientException(String message) {
        super(message);
    }
}
