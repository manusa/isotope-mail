/*
 * MessageFluxSink.java
 *
 * Created on 2018-10-09, 7:43
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
package com.marcnuri.isotope.api.imap;

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.message.Message;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.FluxSink;

import javax.mail.MessagingException;
import javax.mail.URLName;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;

import static com.marcnuri.isotope.api.imap.ImapService.DEFAULT_INITIAL_MESSAGES_BATCH_SIZE;
import static com.marcnuri.isotope.api.imap.ImapService.DEFAULT_MAX_MESSAGES_BATCH_SIZE;
import static com.marcnuri.isotope.api.imap.ImapService.IMAP_CAPABILITY_CONDSTORE;

/**
 * {@link FluxSink} {@link Consumer} implementation to extract messages in batches from the provided folder and send
 * {@link ServerSentEvent}s with the extracted message batches.
 *
 * <p>Created by Marc Nuri <marc@marcnuri.com> on 2018-10-09.
 */
public class MessageFluxSink implements Consumer<FluxSink<ServerSentEvent<List<Message>>>> {

    private static final Logger log = LoggerFactory.getLogger(MessageFluxSink.class);

    private Credentials credentials;
    private URLName folderId;
    private HttpServletResponse response;
    private ImapService imapService;

    MessageFluxSink(Credentials credentials, URLName folderId, HttpServletResponse response, ImapService imapService) {
        this.credentials = credentials;
        this.folderId = folderId;
        this.response = response;
        this.imapService = imapService;
    }

    @Override
    public void accept(FluxSink<ServerSentEvent<List<Message>>> serverSentEventFluxSink) {
        try {
            final IMAPStore store = imapService.getImapStore(credentials);
            final boolean fetchModseq = store.hasCapability(IMAP_CAPABILITY_CONDSTORE);
            final IMAPFolder folder = (IMAPFolder)store.getFolder(folderId);
            processFolder(serverSentEventFluxSink, folder, fetchModseq);
            folder.close();
        } catch (MessagingException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            serverSentEventFluxSink.error(ex);
            finalizeFlux(serverSentEventFluxSink);
            throw  new IsotopeException(ex.getMessage());
        }
        // This bean will be effectively a Prototype, must manually disconnect
        finalizeFlux(serverSentEventFluxSink);
    }

    /**
     * Extracts batches of {@link Message}s from the specified folder starting from the last message.
     *
     * <p>Messages are published in the {@link ServerSentEvent} {@link FluxSink} while it has not been cancelled.
     *
     * @param serverSentEventFluxSink to publish the Message batches
     * @param folder from where to read the Messages
     * @param fetchModseq extract Modseq value from the message
     * @throws MessagingException if there's an IMAP related problem
     */
    private void processFolder(
            FluxSink<ServerSentEvent<List<Message>>> serverSentEventFluxSink, IMAPFolder folder, boolean fetchModseq)
            throws MessagingException {

        // From end to beginning
        int end = folder.getMessageCount();
        int start;
        int batchSize = DEFAULT_INITIAL_MESSAGES_BATCH_SIZE;
        try {
            do {
                start = end - batchSize > 0 ? end - batchSize : 1;
                log.debug("Getting message batch for folder {} [{}-{}]", folder.getName(), start, end);
                response.getOutputStream();
                final ServerSentEvent<List<Message>> event = ServerSentEvent
                        .builder(imapService.getMessages(folder, start, end, fetchModseq))
                        .id(String.valueOf(start))
                        .build();
                serverSentEventFluxSink.next(event);
                end = start - 1;
                batchSize = (batchSize * 2 ) > DEFAULT_MAX_MESSAGES_BATCH_SIZE ? DEFAULT_MAX_MESSAGES_BATCH_SIZE :
                        batchSize * 2;
            } while (end > 0 && !serverSentEventFluxSink.isCancelled());
        } catch(IOException ex) {
            log.debug("Response stream has already been closed ({})", ex.getMessage());
            serverSentEventFluxSink.error(ex);
        }
    }

    /**
     * Complete {@link ServerSentEvent} {@link FluxSink}.
     *
     * <p>Call {@link ImapService#destroy()} method in order to disconnect from server as current instance is a
     * Spring Bean Prototype.
     *
     * <p>Remove all references so that they can be Garbage Collected.
     *
     * @param serverSentEventFluxSink to complete
     */
    private void finalizeFlux(FluxSink<ServerSentEvent<List<Message>>> serverSentEventFluxSink) {
        imapService.destroy();
        serverSentEventFluxSink.complete();
        imapService = null;
        credentials = null;
        folderId = null;
        response = null;

    }
}
