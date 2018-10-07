/*
 * InvalidFieldException.java
 *
 * Created on 2018-08-17, 7:01
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

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-17.
 */
public class InvalidFieldException extends IsotopeException {

    private final Map<String, String> errors;

    public InvalidFieldException() {
        this(null, null);
    }
    @JsonCreator
    public InvalidFieldException(String message) {
        this(message, null);
    }

    public InvalidFieldException(String message, Throwable cause) {
        super(HttpStatus.BAD_REQUEST, message, cause);
        errors = new HashMap<>();
    }

    public void addError(ObjectError objectError) {
        errors.put(
                objectError instanceof FieldError ? ((FieldError)objectError).getField() : objectError.getObjectName(),
                objectError.getDefaultMessage());
    }

}
