/*
 * HttpHeaders.java
 *
 * Created on 2018-08-17, 7:25
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
package com.marcnuri.isotope.api.http;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-17.
 */
public class HttpHeaders {

    private HttpHeaders() {}

    public static final String ISOTOPE_EXCEPTION = "X-Isotope-Exception";
    public static final String ISOTOPE_CRDENTIALS = "X-Isotope-Credentials";
    public static final String ISOTOPE_SALT = "X-Isotope-Salt";
}
