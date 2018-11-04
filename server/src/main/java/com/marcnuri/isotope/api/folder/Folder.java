/*
 * Folder.java
 *
 * Created on 2018-08-08, 16:31
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
package com.marcnuri.isotope.api.folder;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.resource.IsotopeResource;
import com.sun.mail.imap.IMAPFolder;
import org.springframework.lang.Nullable;

import javax.mail.MessagingException;
import javax.mail.URLName;
import java.io.Serializable;
import java.util.*;
import java.util.stream.Stream;

import static javax.mail.Folder.HOLDS_MESSAGES;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Folder extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = 8624907999271453862L;

    private static final String ATTR_HAS_NO_CHILDREN = "\\HasNoChildren";
    private static final Folder[] EMPTY_FOLDERS = {};

    private String folderId;
    // Used when folder renaming to store previous folderId in order to identificate in FE
    private String previousFolderId;
    private String name;
    private char separator;
    private Long UIDValidity;
    private String fullName;
    private String fullURL;
    private Set<String> attributes;
    private int messageCount;
    private int newMessageCount;
    private int unreadMessageCount;
    private int deletedMessageCount;
    private Folder[] children;

    public String getFolderId() {
        return folderId;
    }

    public void setFolderId(String folderId) {
        this.folderId = folderId;
    }

    public String getPreviousFolderId() {
        return previousFolderId;
    }

    public void setPreviousFolderId(String previousFolderId) {
        this.previousFolderId = previousFolderId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public char getSeparator() {
        return separator;
    }

    public void setSeparator(char separator) {
        this.separator = separator;
    }

    public Long getUIDValidity() {
        return UIDValidity;
    }

    public void setUIDValidity(Long UIDValidity) {
        this.UIDValidity = UIDValidity;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFullURL() {
        return fullURL;
    }

    public void setFullURL(String fullURL) {
        this.fullURL = fullURL;
    }

    public Set<String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Set<String> attributes) {
        this.attributes = attributes;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public int getNewMessageCount() {
        return newMessageCount;
    }

    public void setNewMessageCount(int newMessageCount) {
        this.newMessageCount = newMessageCount;
    }

    public int getUnreadMessageCount() {
        return unreadMessageCount;
    }

    public void setUnreadMessageCount(int unreadMessageCount) {
        this.unreadMessageCount = unreadMessageCount;
    }

    public int getDeletedMessageCount() {
        return deletedMessageCount;
    }

    public void setDeletedMessageCount(int deletedMessageCount) {
        this.deletedMessageCount = deletedMessageCount;
    }

    public Folder[] getChildren() {
        return children;
    }

    public void setChildren(Folder[] children) {
        this.children = children;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Folder folder = (Folder) o;
        return separator == folder.separator &&
                messageCount == folder.messageCount &&
                newMessageCount == folder.newMessageCount &&
                unreadMessageCount == folder.unreadMessageCount &&
                deletedMessageCount == folder.deletedMessageCount &&
                Objects.equals(folderId, folder.folderId) &&
                Objects.equals(previousFolderId, folder.previousFolderId) &&
                Objects.equals(name, folder.name) &&
                Objects.equals(UIDValidity, folder.UIDValidity) &&
                Objects.equals(fullName, folder.fullName) &&
                Objects.equals(fullURL, folder.fullURL) &&
                Objects.equals(attributes, folder.attributes) &&
                Arrays.equals(children, folder.children);
    }

    @Override
    public int hashCode() {

        int result = Objects.hash(super.hashCode(), folderId, previousFolderId, name, separator, UIDValidity, fullName, fullURL, attributes, messageCount, newMessageCount, unreadMessageCount, deletedMessageCount);
        result = 31 * result + Arrays.hashCode(children);
        return result;
    }

    public static Folder from(IMAPFolder mailFolder, @Nullable Boolean loadChildren) {
        final Folder ret;
        if (mailFolder != null) {
            ret = new Folder();
            ret.setName(mailFolder.getName());
            try {
                ret.setFolderId(toBase64Id(mailFolder.getURLName()));
                ret.setSeparator(mailFolder.getSeparator());
                ret.setFullName(mailFolder.getFullName());
                ret.setFullURL(mailFolder.getURLName().toString());
                ret.setAttributes(new HashSet<>(Arrays.asList(mailFolder.getAttributes())));
                if ((mailFolder.getType() & HOLDS_MESSAGES) != 0) {
                    ret.setUIDValidity(mailFolder.getUIDValidity());
                    ret.setMessageCount(mailFolder.getMessageCount());
                    ret.setNewMessageCount(mailFolder.getNewMessageCount());
                    ret.setUnreadMessageCount(mailFolder.getUnreadMessageCount());
                    ret.setDeletedMessageCount(mailFolder.getDeletedMessageCount());
                }
                if (Boolean.TRUE.equals(loadChildren) && !ret.getAttributes().contains(ATTR_HAS_NO_CHILDREN)) {
                    ret.setChildren(Stream.of(mailFolder.list())
                            .map(IMAPFolder.class::cast)
                            .map(mf -> from(mf, true))
                            .sorted(Comparator.comparing(Folder::getName))
                            .toArray(Folder[]::new));
                } else {
                    ret.setChildren(EMPTY_FOLDERS);
                }
            } catch (MessagingException e) {
                throw new IsotopeException("Error parsing IMAP Folder", e);
            }
        } else {
            ret = null;
        }
        return ret;
    }


    public static URLName toId(String base64Id) {
        return new URLName(decodeId(base64Id));
    }

    public static String toBase64Id(URLName id) {
        return encodeId(id.toString());
    }

    private static String encodeId(String id) {
        return Base64.getUrlEncoder().encodeToString(id.getBytes());
    }

    private static String decodeId(String encodedId) {
        return new String(Base64.getUrlDecoder().decode(encodedId));
    }
}
