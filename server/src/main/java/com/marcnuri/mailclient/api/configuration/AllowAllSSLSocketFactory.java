/*
 * AllowAllSSLSocketFactory.java
 *
 * Created on Nov 17, 2012, 9:23:13 AM
 */
package com.marcnuri.mailclient.api.configuration;

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
            sslSocketFactory = (SSLSocketFactory) sslcontext.getSocketFactory();
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
            return null;
        }
    }
}
