/*
 * Folder.java
 *
 * Created on 2018-08-08, 16:31
 */
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.resource.IsotopeResource;
import com.sun.mail.imap.IMAPFolder;
import org.springframework.lang.Nullable;

import javax.mail.MessagingException;
import javax.mail.URLName;
import java.io.Serializable;
import java.util.Arrays;
import java.util.Base64;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
public class Folder extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = 8624907999271453862L;

    private static final Folder[] EMPTY_FOLDERS = {};

    private String folderId;
    private String name;
    private char separator;
    private Long UIDValidity;
    private String fullName;
    private String fullURL;
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
                Objects.equals(name, folder.name) &&
                Objects.equals(UIDValidity, folder.UIDValidity) &&
                Objects.equals(fullName, folder.fullName) &&
                Objects.equals(fullURL, folder.fullURL) &&
                Arrays.equals(children, folder.children);
    }

    @Override
    public int hashCode() {

        int result = Objects.hash(super.hashCode(), folderId, name, separator, UIDValidity, fullName, fullURL, messageCount, newMessageCount, unreadMessageCount, deletedMessageCount);
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
                ret.setUIDValidity(mailFolder.getUIDValidity());
                ret.setFullName(mailFolder.getFullName());
                ret.setFullURL(mailFolder.getURLName().toString());
                ret.setMessageCount(mailFolder.getMessageCount());
                ret.setNewMessageCount(mailFolder.getNewMessageCount());
                ret.setUnreadMessageCount(mailFolder.getUnreadMessageCount());
                ret.setDeletedMessageCount(mailFolder.getDeletedMessageCount());
                if (Boolean.TRUE.equals(loadChildren)) {
                    ret.setChildren(Stream.of(mailFolder.list())
                            .map(IMAPFolder.class::cast)
                            .map(mf -> from(mf, true)).toArray(Folder[]::new));
                } else {
                    ret.setChildren(EMPTY_FOLDERS);
                }
            } catch (MessagingException e) {
                throw new IsotopeException("Error parsing IMAP Folder");
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
