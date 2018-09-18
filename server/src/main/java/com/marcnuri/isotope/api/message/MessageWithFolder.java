/*
 * MessageWithFolder.java
 *
 * Created on 2018-09-17, 6:55
 */
package com.marcnuri.isotope.api.message;

import com.marcnuri.isotope.api.folder.Folder;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;

import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-17.
 */
public class MessageWithFolder extends Message {

    private static final long serialVersionUID = 6864526689572356395L;

    private Folder folder;

    public Folder getFolder() {
        return folder;
    }

    public void setFolder(Folder folder) {
        this.folder = folder;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        MessageWithFolder that = (MessageWithFolder) o;
        return Objects.equals(folder, that.folder);
    }

    @Override
    public int hashCode() {

        return Objects.hash(super.hashCode(), folder);
    }


    public static MessageWithFolder from(IMAPFolder folder, IMAPMessage imapMessage) {
        return from(folder, true, imapMessage);
    }

    public static MessageWithFolder from(IMAPFolder folder, boolean loadChildrenFolders, IMAPMessage imapMessage) {
        final MessageWithFolder ret = from(MessageWithFolder.class, folder, imapMessage);
        ret.setFolder(Folder.from(folder, loadChildrenFolders));
        return ret;
    }

}
