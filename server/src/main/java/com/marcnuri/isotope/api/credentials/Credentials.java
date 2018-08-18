/*
 * Credentials.java
 *
 * Created on 2018-08-15, 18:10
 */
package com.marcnuri.isotope.api.credentials;

import com.marcnuri.isotope.api.resource.IsotopeResource;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.io.Serializable;
import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
public class Credentials extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = -3763522029969923952L;

    private String encrypted;
    private String salt;
    @NotNull(groups=Login.class)
    private String serverHost;
    @NotNull(groups=Login.class)
    @Positive(groups=Login.class)
    private Integer serverPort;
    @NotNull(groups=Login.class)
    private String user;
    @NotNull(groups=Login.class)
    private String password;

    public String getEncrypted() {
        return encrypted;
    }

    public void setEncrypted(String encrypted) {
        this.encrypted = encrypted;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public String getServerHost() {
        return serverHost;
    }

    public void setServerHost(String serverHost) {
        this.serverHost = serverHost;
    }

    public Integer getServerPort() {
        return serverPort;
    }

    public void setServerPort(Integer serverPort) {
        this.serverPort = serverPort;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Credentials that = (Credentials) o;
        return Objects.equals(encrypted, that.encrypted) &&
                Objects.equals(salt, that.salt) &&
                Objects.equals(serverHost, that.serverHost) &&
                Objects.equals(serverPort, that.serverPort) &&
                Objects.equals(user, that.user) &&
                Objects.equals(password, that.password);
    }

    @Override
    public int hashCode() {

        return Objects.hash(super.hashCode(), encrypted, salt, serverHost, serverPort, user, password);
    }


    /**
     * Validation Group interface for login
     */
    public interface Login {}

}
