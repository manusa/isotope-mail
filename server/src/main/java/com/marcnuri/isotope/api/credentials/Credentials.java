/*
 * Credentials.java
 *
 * Created on 2018-08-15, 18:10
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
package com.marcnuri.isotope.api.credentials;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.marcnuri.isotope.api.resource.IsotopeResource;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.io.Serializable;
import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
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
    @NotNull(groups=Login.class)
    private Boolean imapSsl;
    private String smtpHost;
    @NotNull(groups=Login.class)
    @Positive(groups=Login.class)
    private Integer smtpPort;
    @NotNull(groups=Login.class)
    private Boolean smtpSsl;

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

    public Boolean getImapSsl() {
        return imapSsl;
    }

    public void setImapSsl(Boolean imapSsl) {
        this.imapSsl = imapSsl;
    }

    public String getSmtpHost() {
        return smtpHost;
    }

    public void setSmtpHost(String smtpHost) {
        this.smtpHost = smtpHost;
    }

    public Integer getSmtpPort() {
        return smtpPort;
    }

    public void setSmtpPort(Integer smtpPort) {
        this.smtpPort = smtpPort;
    }

    public Boolean getSmtpSsl() {
        return smtpSsl;
    }

    public void setSmtpSsl(Boolean smtpSsl) {
        this.smtpSsl = smtpSsl;
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
                Objects.equals(password, that.password) &&
                Objects.equals(imapSsl, that.imapSsl) &&
                Objects.equals(smtpHost, that.smtpHost) &&
                Objects.equals(smtpPort, that.smtpPort) &&
                Objects.equals(smtpSsl, that.smtpSsl);
    }

    @Override
    public int hashCode() {

        return Objects.hash(super.hashCode(), encrypted, salt, serverHost, serverPort, user, password, imapSsl, smtpHost, smtpPort, smtpSsl);
    }

    /**
     * Validation Group interface for login
     */
    public interface Login {}

}
