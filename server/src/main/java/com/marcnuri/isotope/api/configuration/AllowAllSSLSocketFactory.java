/*
 * AllowAllSSLSocketFactory.java
 *
 * Created on Nov 17, 2012, 9:23:13 AM
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

import javax.net.SocketFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

/**
 *
 * @author Marc Nuri <marc@marcnuri.com>
 */
public class AllowAllSSLSocketFactory extends SSLSocketFactory {

//**************************************************************************************************
//  Fields
//**************************************************************************************************
    private final SSLSocketFactory sslSocketFactory;

//**************************************************************************************************
//  Constructors
//**************************************************************************************************
    public AllowAllSSLSocketFactory() {
        try {
            SSLContext sslcontext = SSLContext.getInstance("TLS");
            sslcontext.init(null,
                    new TrustManager[]{new AlwaysTrustManager()},
                    new java.security.SecureRandom());
            sslSocketFactory = sslcontext.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

//**************************************************************************************************
//  Abstract Methods
//**************************************************************************************************
//**************************************************************************************************
//  Overridden Methods
//**************************************************************************************************
    @Override
    public Socket createSocket(Socket socket, String s, int i, boolean flag)
            throws IOException {
        return sslSocketFactory.createSocket(socket, s, i, flag);
    }

    @Override
    public Socket createSocket(InetAddress inaddr, int i, InetAddress inaddr1,
            int j) throws IOException {
        return sslSocketFactory.createSocket(inaddr, i, inaddr1, j);
    }

    @Override
    public Socket createSocket(InetAddress inaddr, int i) throws IOException {
        return sslSocketFactory.createSocket(inaddr, i);
    }

    @Override
    public Socket createSocket(String s, int i, InetAddress inaddr, int j)
            throws IOException {
        return sslSocketFactory.createSocket(s, i, inaddr, j);
    }

    @Override
    public Socket createSocket(String s, int i) throws IOException {
        return sslSocketFactory.createSocket(s, i);
    }

    @Override
    public Socket createSocket() throws IOException {
        return sslSocketFactory.createSocket();
    }

    @Override
    public String[] getDefaultCipherSuites() {
        return sslSocketFactory.getSupportedCipherSuites();
    }

    @Override
    public String[] getSupportedCipherSuites() {
        return sslSocketFactory.getSupportedCipherSuites();
    }

//**************************************************************************************************
//  Other Methods
//**************************************************************************************************
//**************************************************************************************************
//  Getter/Setter Methods
//**************************************************************************************************
//**************************************************************************************************
//  Static Methods
//**************************************************************************************************
    public static SocketFactory getDefault() {
        return new AllowAllSSLSocketFactory();
    }

//**************************************************************************************************
//  Inner Classes
//**************************************************************************************************
    private final static class AlwaysTrustManager implements X509TrustManager {

        @Override
        public void checkClientTrusted(X509Certificate[] xcs, String string)
                throws CertificateException {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] xcs, String string)
                throws CertificateException {
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }
}
