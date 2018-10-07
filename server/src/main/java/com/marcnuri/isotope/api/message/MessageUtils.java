/*
 * MessageUtils.java
 *
 * Created on 2018-09-16, 16:09
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

import org.springframework.lang.NonNull;

import javax.mail.FetchProfile;
import javax.mail.MessagingException;
import javax.mail.UIDFolder;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-16.
 */
public class MessageUtils {

    private MessageUtils() {}

    /**
     * Fetches the envelope and basic "lightweight" fields from the provided {@link javax.mail.Message} array.
     *
     * @param folder the folder where the messages are located
     * @param messages array of messages for which to fetch information
     * @throws MessagingException for other javax.mail failures
     */
    @SuppressWarnings("squid:S1191")
    public static void envelopeFetch(@NonNull  javax.mail.Folder folder, @NonNull javax.mail.Message[] messages)
            throws MessagingException {

        if (messages.length != 0) {
            final FetchProfile fp = new FetchProfile();
            fp.add(FetchProfile.Item.ENVELOPE);
            fp.add(UIDFolder.FetchProfileItem.UID);
            fp.add(com.sun.mail.imap.IMAPFolder.FetchProfileItem.HEADERS);
            fp.add(FetchProfile.Item.FLAGS);
            fp.add(FetchProfile.Item.SIZE);
            folder.fetch(messages, fp);
        }
    }
}
