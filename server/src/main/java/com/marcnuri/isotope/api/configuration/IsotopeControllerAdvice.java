/*
 * IsotopeControllerAdvice.java
 *
 * Created on 2018-08-17, 6:49
 */
package com.marcnuri.isotope.api.configuration;

import com.marcnuri.isotope.api.IsotopeApiApplication;
import com.marcnuri.isotope.api.exception.InvalidFieldException;
import com.marcnuri.isotope.api.exception.IsotopeException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-17.
 */
@SuppressWarnings("unchecked")
@ControllerAdvice(basePackageClasses = IsotopeApiApplication.class)
public class IsotopeControllerAdvice extends ResponseEntityExceptionHandler {

    @ExceptionHandler(IsotopeException.class)
    public <T extends IsotopeException> ResponseEntity<String> handleIsotopeException(T exception) {
        return exception.toFrontEndResponseEntity();
    }

    @Override
    protected ResponseEntity handleBindException(BindException ex, HttpHeaders headers,
                                                 HttpStatus status, WebRequest request) {
        return handleValidationException(ex.getBindingResult().getAllErrors());
    }

    @Override
    protected ResponseEntity handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                          HttpHeaders headers, HttpStatus status, WebRequest request) {
        return handleValidationException(ex.getBindingResult().getAllErrors());
    }

    private ResponseEntity<String> handleValidationException(List<? extends ObjectError> errors) {
        final InvalidFieldException invalidField = new InvalidFieldException();
        errors.forEach(invalidField::addError);
        return handleIsotopeException(invalidField);
    }
}
