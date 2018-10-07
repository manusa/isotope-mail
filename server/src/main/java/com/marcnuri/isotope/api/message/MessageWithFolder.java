/*
 * MessageWithFolder.java
 *
 * Created on 2018-09-17, 6:55
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
