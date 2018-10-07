/*
 * IsotopeControllerAdvice.java
 *
 * Created on 2018-08-17, 6:49
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
