/*
 * IsotopeURLDataSource.java
 *
 * Created on 2018-12-03, 7:25
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

import com.marcnuri.isotope.api.credentials.Credentials;
import org.springframework.lang.NonNull;

import javax.activation.DataSource;
import javax.mail.EncodingAware;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

import static com.marcnuri.isotope.api.http.HttpHeaders.ISOTOPE_CRDENTIALS;
import static com.marcnuri.isotope.api.http.HttpHeaders.ISOTOPE_SALT;

/**
 * Based on {@link javax.activation.URLDataSource}, tweaked to work with {@link Credentials}.
 *
 * The (Isotope)URLDataSource class provides an object that wraps a URL object in a DataSource interface.
 * (Isotope)URLDataSource simplifies the handling of data described by URLs within the JavaBeans Activation Framework
 * because this class can be used to create new DataHandlers.
 *
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-12-03.
 */
public class IsotopeURLDataSource implements DataSource, EncodingAware {

    private static final String BASE64_ENCODING = "base64";
    private final URL url;
    private final String credentials;
    private final String salt;
    private final String contentType;

    /**
     * IsotopeURLDataSource contructor.
     * Connection will only be open if getInputStream or getOutputStream are invoked.
     * <p>
     * Isotope encrypted credential headers will be extracted from HttpServletRequest.
     * <p>
     * @param url to connect to
     * @param contentType of the connected resource
     * @param request from which to extract Isotope specific credential headers
     */
    public IsotopeURLDataSource(@NonNull URL url, String contentType, @NonNull HttpServletRequest request) {
        this.url = url;
        this.credentials = request.getHeader(ISOTOPE_CRDENTIALS);
        this.salt = request.getHeader(ISOTOPE_SALT);
        this.contentType = contentType;
    }

    /**
     * Opens the connection to the URL with the appropriate HTTP Isotope credential headers
     * @return open URLConnection to the URL
     * @throws IOException
     */
    private URLConnection openConnection() throws IOException {
        final URLConnection urlConnection = url.openConnection();
        urlConnection.setRequestProperty (ISOTOPE_CRDENTIALS, credentials);
        urlConnection.setRequestProperty (ISOTOPE_SALT, salt);
        urlConnection.setUseCaches(false);
        urlConnection.setDoInput(true);
        urlConnection.setDoOutput(true);
        return urlConnection;
    }

    /**
     * Opens a connection and returns the input stream.
     *
     * @return the input stream
     * @throws IOException if there is any connection problem
     */
    @Override
    public InputStream getInputStream() throws IOException {
        return openConnection().getInputStream();
    }

    /**
     * Opens a connection and returns the output stream.
     *
     * @return the output stream
     * @throws IOException if there is any connection problem
     */
    @Override
    public OutputStream getOutputStream() throws IOException {
        return openConnection().getOutputStream();
    }

    /**
     * Returns the Content-type specified in the constructor.
     *
     * @return Content-type
     */
    @Override
    public String getContentType() {
        return contentType;
    }

    /**
     * Extracts the name of the resource from the URL
     *
     * @return name
     */
    @Override
    public String getName() {
        return url.getFile();
    }

    /**
     * Always retursn base64
     *
     * This DataSource is intended to retrieve Isotope attachments, mostly binary code
     *
     * @return encoding (base64)
     */
    @Override
    public String getEncoding() {
        return BASE64_ENCODING;
    }
}
