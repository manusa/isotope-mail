/*
 * ImapService.java
 *
 * Created on 2018-08-08, 16:34
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

import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.exception.AuthenticationException;
import com.marcnuri.isotope.api.exception.InvalidFieldException;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.exception.NotFoundException;
import com.marcnuri.isotope.api.folder.Folder;
import com.marcnuri.isotope.api.folder.FolderUtils;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageWithFolder;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;
import com.sun.mail.imap.IMAPStore;
import com.sun.mail.util.MailSSLSocketFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;
import reactor.core.publisher.Flux;

import javax.annotation.PreDestroy;
import javax.mail.BodyPart;
import javax.mail.Flags;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import javax.mail.Session;
import javax.mail.UIDFolder;
import javax.mail.URLName;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration.DEFAULT_CONNECTION_TIMEOUT;
import static com.marcnuri.isotope.api.exception.AuthenticationException.Type.IMAP;
import static com.marcnuri.isotope.api.folder.FolderResource.addLinks;
import static com.marcnuri.isotope.api.folder.FolderUtils.addSystemFolders;
import static com.marcnuri.isotope.api.folder.FolderUtils.getFileWithRef;
import static com.marcnuri.isotope.api.message.MessageUtils.envelopeFetch;
import static com.marcnuri.isotope.api.message.MessageUtils.extractBodypart;
import static com.marcnuri.isotope.api.message.MessageUtils.extractContent;
import static com.marcnuri.isotope.api.message.MessageUtils.replaceEmbeddedImage;
import static javax.mail.Folder.READ_ONLY;
import static javax.mail.Folder.READ_WRITE;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Service
@RequestScope
@Primary
@SuppressWarnings("squid:S4529")
public class ImapService {

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private static final String IMAP_PROTOCOL = "imap";
    private static final String IMAPS_PROTOCOL = "imaps";
    static final String IMAP_CAPABILITY_CONDSTORE = "CONDSTORE";
    public static final String MULTIPART_MIME_TYPE = "multipart/";
    static final int DEFAULT_INITIAL_MESSAGES_BATCH_SIZE = 20;
    static final int DEFAULT_MAX_MESSAGES_BATCH_SIZE = 640;

    private final IsotopeApiConfiguration isotopeApiConfiguration;
    private final MailSSLSocketFactory mailSSLSocketFactory;
    private final CredentialsService credentialsService;

    private IMAPStore imapStore;

    @Autowired
    public ImapService(
            IsotopeApiConfiguration isotopeApiConfiguration, MailSSLSocketFactory mailSSLSocketFactory,
            CredentialsService credentialsService) {

        this.isotopeApiConfiguration = isotopeApiConfiguration;
        this.mailSSLSocketFactory = mailSSLSocketFactory;
        this.credentialsService = credentialsService;
    }

    /**
     * Checks if specified {@link Credentials} are valid and returns a new Credentials object with
     * encrypted values.
     *
     * @param credentials to validate
     * @return credentials object with encrypted values
     */
    public Credentials checkCredentials(Credentials credentials) {
        try {
            credentialsService.checkHost(credentials);
            getImapStore(credentials).getDefaultFolder();
            return credentialsService.encrypt(credentials);
        } catch (MessagingException | IOException e) {
            throw new AuthenticationException(IMAP);
        }
    }

    public List<Folder> getFolders(@Nullable Boolean loadChildren) {
        try {
            final IMAPFolder rootFolder = (IMAPFolder)getImapStore().getDefaultFolder();
            final List<Folder> folders = Stream.of(rootFolder.list())
                    .map(IMAPFolder.class::cast)
                    .map(mf -> Folder.from(mf, loadChildren))
                    .sorted(Comparator.comparing(Folder::getName))
                    .collect(Collectors.toList());
            addSystemFolders(rootFolder, folders);
            // Clear \Recent flags by opening and closing the INBOX
            if (folders.stream().anyMatch(
                    f -> f.getName().equalsIgnoreCase("INBOX") && f.getNewMessageCount() > 0)) {
                final IMAPFolder inbox = (IMAPFolder)rootFolder.getFolder("INBOX");
                inbox.open(READ_WRITE);
                inbox.getNewMessageCount();
                inbox.close();
            }
            return folders;
        } catch (MessagingException ex) {
            log.error("Error loading folders", ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    /**
     * Creates a new folder in the 1st level of the user's mailbox (root level)
     *
     * @param newFolderName name for the folder to be created
     * @return List of 1st level folders with the new folder included
     */
    public List<Folder> createRootFolder(@NonNull String newFolderName) {
        try {
            final IMAPFolder rootFolder = (IMAPFolder)getImapStore().getDefaultFolder();
            final IMAPFolder newFolder = (IMAPFolder)rootFolder.getFolder(newFolderName);
            if (!newFolder.exists()) {
                newFolder.create(IMAPFolder.HOLDS_MESSAGES | IMAPFolder.HOLDS_FOLDERS);
            }
            return Arrays.asList(Folder.from(rootFolder, true).getChildren());
        } catch (MessagingException ex) {
            log.error("Error creating new root folder {}", newFolderName, ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    /**
     * Creates a new folder in the 1st level of the user's mailbox (root level)
     *
     * @param parentFolderId Id of the folder to which to add the new child
     * @param newFolderName name for the folder to be created
     * @return Updated parent folder with child folders with the new folder included
     */
    public Folder createChildFolder(@NonNull  URLName parentFolderId, @NonNull String newFolderName) {

        try {
            final IMAPFolder parentFolder = getFolder(parentFolderId);
            final IMAPFolder newFolder = (IMAPFolder)parentFolder.getFolder(newFolderName);
            if (!newFolder.exists()) {
                newFolder.create(IMAPFolder.HOLDS_MESSAGES | IMAPFolder.HOLDS_FOLDERS);
            }
            // Must fetch folder again as attributes for the folder have changed and are cached in IMAPFolder
            return Folder.from(getFolder(parentFolderId), true);
        } catch (MessagingException ex) {
            log.error("Error creating new folder {} under {}", newFolderName, parentFolderId, ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    /**
     * Renames the folder with the provided {@link URLName} to the specified newName.
     *
     * <p>The newName must not contain the folder separator character.
     *
     * @param folderToRenameId Id of the folder to rename
     * @param newName New name for the provided folder Id
     * @return Folder with containing metadata from the parent of the renamed folder and all of its children
     */
    public Folder renameFolder(URLName folderToRenameId, @NonNull String newName) {
        try {
            final IMAPFolder folder = getFolder(folderToRenameId);
            newName = newName.replaceAll("[.\\[\\]/\\\\&~*]", ""); /// Sanitize name
            if (newName.isEmpty() || newName.indexOf(folder.getSeparator()) >= 0) {
                throw new InvalidFieldException("New folder name contains invalid characters");
            }
            final String folderToRenameFullName = folder.getFullName();
            final String newFolderFullName = String.format("%s%s",
                    folderToRenameFullName.substring(0, folderToRenameFullName.lastIndexOf(folder.getName())),
                    newName
            );
            return FolderUtils.renameFolder(folder, newFolderFullName);
        } catch (MessagingException ex) {
            log.error("Error renaming folder " + folderToRenameId.toString(), ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    /**
     * Moves the folder with the provided {@link URLName} to the specified target folder with the provided
     * URLName or to the first level if the target folder is null.
     *
     * <p>Both folders must exist in order for the action to complete successfully.
     *
     * @param folderToMoveId Id of the folder to move
     * @param targetFolderId Id of the target folder
     * @return
     */
    public Folder moveFolder(@NonNull URLName folderToMoveId, @Nullable URLName targetFolderId) {
        try {
            final IMAPFolder folderToMove = getFolder(folderToMoveId);
            final String movedFolderFullName;
            if (targetFolderId == null) {
                movedFolderFullName = folderToMove.getName();
            } else {
                final IMAPFolder targetFolder = getFolder(targetFolderId);
                movedFolderFullName = String.format("%s%s%s",
                        targetFolder.getFullName(), targetFolder.getSeparator(), folderToMove.getName());
            }
            return FolderUtils.renameFolder(folderToMove, movedFolderFullName);
        } catch (MessagingException ex) {
            log.error("Error moving folder " + folderToMoveId.toString(), ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    /**
     * Permanently deletes the folder with the provided {@link URLName} and its children.
     *
     * @param folderToDeleteId Id of the folder to delete
     * @return Parent of deleted folder
     */
    public Folder deleteFolder(@NonNull URLName folderToDeleteId) {
        try {
            final IMAPFolder folderToDelete = getFolder(folderToDeleteId);
            final IMAPFolder parent = (IMAPFolder)folderToDelete.getParent();
            folderToDelete.delete(true);
            return Folder.from(parent, true);
        } catch (MessagingException ex) {
            log.error("Error deleting folder " + folderToDeleteId.toString(), ex);
            throw new IsotopeException(ex.getMessage());
        }
    }

    public Flux<ServerSentEvent<List<Message>>> getMessagesFlux(URLName folderId, HttpServletResponse response) {

        return Flux.create(new MessageFluxSinkConsumer(
                (Credentials)SecurityContextHolder.getContext().getAuthentication(), folderId, response,this));
    }

    public MessageWithFolder getMessage(URLName folderId, Long uid) {
        try {
            final IMAPFolder folder = getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_ONLY);
            }
            final IMAPMessage imapMessage = (IMAPMessage)folder.getMessageByUID(uid);
            if (imapMessage == null) {
                folder.close();
                throw new NotFoundException("Message not found");
            }
            final MessageWithFolder ret = MessageWithFolder.from(folder, imapMessage);
            readContentIntoMessage(folderId, imapMessage, ret);
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public List<Message> preloadMessages(@NonNull URLName folderId, @NonNull List<Long> uids) {

        try {
            final IMAPFolder folder = getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_ONLY);
            }
            final List<Message> ret = new ArrayList<>(uids.size());
            final List<IMAPMessage> messages = Stream.of(
                    folder.getMessagesByUID(uids.stream().mapToLong(Long::longValue).toArray()))
                    .filter(Objects::nonNull)
                    .map(IMAPMessage.class::cast)
                    .collect(Collectors.toList());
            for(IMAPMessage imapMessage : messages) {
                final Message message = Message.from(folder, imapMessage);
                ret.add(message);
                imapMessage.setPeek(true);
                readContentIntoMessage(folderId, imapMessage, message);
            }
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public void readAttachment(
            HttpServletResponse response, URLName folderId, Long messageId, String id, Boolean isContentId) {

        try {
            final IMAPFolder folder = getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_ONLY);
            }
            final IMAPMessage imapMessage = (IMAPMessage)folder.getMessageByUID(messageId);
            final Object content = imapMessage.getContent();
            if (content instanceof Multipart) {
                final BodyPart bp = extractBodypart((Multipart)content, id, isContentId);
                if (bp != null) {
                    response.setContentType(bp.getContentType());
                    bp.getDataHandler().writeTo(response.getOutputStream());
                    response.getOutputStream().flush();
                } else {
                    throw new NotFoundException("Attachment not found");
                }
            }
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }

    }

    /**
     * Moves the provided messages from the specified folderId to the specified destination folderId.
     *
     * To maximize compatibility with IMAP servers, move is performed using a regular copy and delete in the originating
     * folder, and a retrieval of messages in the target folder.
     *
     * @param fromFolderId name of the originating folder
     * @param toFolderId name of the target folder
     * @param uids list of uids to move
     * @return list of new messages in the target folder since the move operation started (may include additional messages)
     */
    public List<MessageWithFolder> moveMessages(URLName fromFolderId, URLName toFolderId, List<Long> uids) {
        try {
            final IMAPFolder fromFolder = getFolder(fromFolderId);
            fromFolder.open(READ_WRITE);
            final IMAPFolder toFolder = getFolder(toFolderId);
            toFolder.open(READ_ONLY);
            long toFolderNextUID = toFolder.getUIDNext();
            toFolder.close(false);

            // Maximize IMAP compatibility, perform COPY and DELETE
            final javax.mail.Message[] messagesToMove = Stream.of(getMessagesByUID(fromFolder, uids))
                    .filter(m -> !m.isExpunged())
                    .toArray(javax.mail.Message[]::new);
            if (messagesToMove.length > 0) {
                fromFolder.copyMessages(messagesToMove, toFolder);
                for (javax.mail.Message m : messagesToMove) {
                    m.setFlag(Flags.Flag.DELETED, true);
                }
                fromFolder.expunge(messagesToMove);
            }

            // Retrieve new messages in target folder
            toFolder.open(READ_ONLY);
            // copy operation may not have finished, wait a little
            javax.mail.Message[] newMessages;
            int retries = 5;
            final long sleepTimeMillis = 100L;
            while((newMessages = toFolder.getMessagesByUID(toFolderNextUID, UIDFolder.LASTUID)).length == 0
                    && retries-- > 0) {
                Thread.sleep(sleepTimeMillis);
            }
            envelopeFetch(toFolder, newMessages);
            final List<MessageWithFolder> ret = Stream.of(newMessages)
                    .map(m -> MessageWithFolder.from(toFolder, true, (IMAPMessage)m))
                    .collect(Collectors.toList());
            fromFolder.close(false);
            toFolder.close(false);
            return ret;
        } catch(InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.error("Error moving messages when waiting for COPY to complete", ex);
            throw new IsotopeException(ex.getMessage(), ex);

        } catch (MessagingException ex) {
            log.error("Error moving messages", ex);
            log.debug("Error moving messages from folder {} to folder {}", fromFolderId, toFolderId);
            throw new IsotopeException(ex.getMessage(), ex);
        }
    }

    /**
     * Sets the seen Flag ({@link javax.mail.Flags.Flag#SEEN}) to the provided boolean value for the specified
     * messages uids
     *
     * @param folderId
     * @param seen
     * @param uids
     */
    public void setMessagesSeen(URLName folderId, boolean seen, long... uids) {
        setMessagesFlag(folderId, Flags.Flag.SEEN, seen, uids);
    }

    public void setMessagesFlagged(URLName folderId, boolean flagged, long... uids) {
       setMessagesFlag(folderId, Flags.Flag.FLAGGED, flagged, uids);
    }

    /**
     * Flag deleted and expunge all messages from the provided folderId (Clear/Empty folder)
     *
     * @param folderId of the folder from which to delete all messages
     * @return updated folder after deleting all messages
     */
    public Folder deleteAllFolderMessages(@NonNull URLName folderId) {
        try {
            final IMAPFolder folder = getFolder(folderId);
            folder.open(READ_WRITE);
            folder.setFlags(folder.getMessages(), new Flags(Flags.Flag.DELETED), true);
            folder.expunge();
            return Folder.from(folder, true);
        } catch (MessagingException ex) {
            throw new IsotopeException(ex.getMessage(), ex);
        }
    }

    public Folder deleteMessages(@NonNull URLName folderId, @NonNull List<Long> uids) {
        try {
            final IMAPFolder folder = getFolder(folderId);
            folder.open(READ_WRITE);
            final javax.mail.Message[] messages = getMessagesByUID(folder, uids);
            folder.setFlags(messages, new Flags(Flags.Flag.DELETED), true);
            folder.expunge(messages);
            return Folder.from(folder, true);
        } catch (MessagingException ex) {
            throw new IsotopeException(ex.getMessage(), ex);
        }
    }

    @PreDestroy
    public void destroy() {
        log.debug("ImapService destroyed");
        if(imapStore != null) {
            try {
                imapStore.close();
            } catch (MessagingException ex) {
                log.error("Error closing IMAP Store", ex);
            }
        }
    }

    private IMAPStore getImapStore() throws MessagingException {
        return getImapStore((Credentials)SecurityContextHolder.getContext().getAuthentication());
    }

    IMAPStore getImapStore(Credentials credentials) throws MessagingException {
        if (imapStore == null) {
            final Session session = Session.getInstance(initMailProperties(credentials, mailSSLSocketFactory), null);
            imapStore = (IMAPStore) session.getStore(credentials.getImapSsl() ? IMAPS_PROTOCOL : IMAP_PROTOCOL);
            imapStore.connect(
                    credentials.getServerHost(),
                    credentials.getServerPort(),
                    credentials.getUser(),
                    credentials.getPassword());
            log.debug("Opened new ImapStore session");
        }
        return imapStore;
    }

    List<Message> getMessages(
            @NonNull IMAPFolder folder, @Nullable Integer start, @Nullable Integer end, boolean fetchModseq)
            throws MessagingException {

        if (!folder.isOpen()) {
            folder.open(READ_ONLY);
        }
        final javax.mail.Message[] messages;
        if (start != null && end != null) {
            // start / end message counts may no longer match, recalculate index if necessary
            if (end > folder.getMessageCount()) {
                start = folder.getMessageCount() - (end - start);
                end = folder.getMessageCount();
            }
            messages = folder.getMessages(start < 1 ? 1 : start, end);
        } else {
            messages = folder.getMessages();
        }
        envelopeFetch(folder, messages);
        final Long highestModseq;
        if (fetchModseq && messages.length > 0) {
            highestModseq = folder.getHighestModSeq() == -1L ?
                    ((IMAPMessage) messages[messages.length - 1]).getModSeq() : folder.getHighestModSeq();
        } else {
            highestModseq = null;
        }
        return Stream.of(messages)
                .map(m -> Message.from(folder, (IMAPMessage)m))
                .peek(m -> m.setModseq(highestModseq))
                .sorted(Comparator.comparingLong(Message::getUid).reversed())
                .collect(Collectors.toList());
    }

    private IMAPFolder getFolder(URLName folderId) throws MessagingException {
        final IMAPFolder folder = (IMAPFolder)getImapStore().getFolder(getFileWithRef(folderId));
        if (!folder.exists()) {
            throw new NotFoundException(String.format("Folder %s not found", folderId.toString()));
        }
        return folder;
    }

    private void setMessagesFlag(URLName folderId, Flags.Flag flag, boolean flagValue, long... uids) {
        try {
            final IMAPFolder folder = getFolder(folderId);
            folder.open(READ_WRITE);
            final javax.mail.Message[] messages = getMessagesByUID(folder, uids);
            folder.setFlags(messages, new Flags(flag), flagValue);
            folder.close(false);
        } catch (MessagingException ex) {
            throw new IsotopeException(ex.getMessage(), ex);
        }
    }

    /**
     * Returns a list of  {@link Attachment}s and replaces embedded images in {@link Message#content} if they are
     * small in order to avoid future calls to the API which may result more expensive.
     *
     * @param finalMessage
     * @param mp
     * @param attachments
     * @return
     * @throws MessagingException
     * @throws IOException
     */
    private List<Attachment> extractAttachments(
            @NonNull Message finalMessage, @NonNull Multipart mp, @Nullable List<Attachment> attachments)
            throws MessagingException, IOException {

        if (attachments == null){
            attachments = new ArrayList<>();
        }
        for (int it = 0; it < mp.getCount(); it++) {
            final BodyPart bp = mp.getBodyPart(it);
            // Multipart message with embedded parts
            if (bp.getContentType().toLowerCase().startsWith(MULTIPART_MIME_TYPE)) {
                extractAttachments(finalMessage, (Multipart) bp.getContent(), attachments);
            }
            // Image attachments
            else if (bp.getContentType().toLowerCase().startsWith("image/")
                    && bp instanceof MimeBodyPart
                    && ((MimeBodyPart) bp).getContentID() != null) {
                // If image is "not too big" embed as base64 data uri - successive IMAP connections will be more expensive
                if (bp.getSize() <= isotopeApiConfiguration.getEmbeddedImageSizeThreshold()) {
                    finalMessage.setContent(replaceEmbeddedImage(finalMessage.getContent(), (MimeBodyPart)bp));
                } else {
                    attachments.add(new Attachment(
                            ((MimeBodyPart) bp).getContentID(), bp.getFileName(), bp.getContentType(), bp.getSize()));
                }
            }
            // Embedded messages
            else if (bp.getContentType().toLowerCase().startsWith("message/")) {
                final Object nestedMessage = bp.getContent();
                if (nestedMessage instanceof MimeMessage) {
                    attachments.add(new Attachment(null, ((MimeMessage)nestedMessage).getSubject(),
                            bp.getContentType(), ((MimeMessage)nestedMessage).getSize()));
                }
            }
            // Regular files
            else if (bp.getDisposition() != null && bp.getDisposition().equalsIgnoreCase(Part.ATTACHMENT)) {
                attachments.add(new Attachment(
                        null, MimeUtility.decodeText(bp.getFileName()), bp.getContentType(), bp.getSize()));
            }
        }
        return attachments;
    }

    private void readContentIntoMessage(URLName folderId, @NonNull IMAPMessage imapMessage, @NonNull Message message)
            throws MessagingException, IOException {

        final Object content = imapMessage.getContent();
        if (content instanceof Multipart) {
            message.setContent(extractContent((Multipart) content));
            message.setAttachments(addLinks(Folder.toBase64Id(folderId), message,
                    extractAttachments(message, (Multipart) content, null)));
        } else if (content instanceof MimeMessage
                && ((MimeMessage) content).getContentType().toLowerCase().contains("html")) {
            message.setContent(content.toString());
        } else if (imapMessage.getContentType().indexOf(MediaType.TEXT_HTML_VALUE) == 0){
            message.setContent(content.toString());
        } else {
            //Preserve formatting
            message.setContent(content.toString()
                    .replace("\r\n", "<br />" )
                    .replaceAll("[\\r\\n]", "<br />"));
        }
    }

    /**
     * Returns an array of {@link javax.mail.Message} with <strong>no</strong> null entries from an array of uids for
     * the provided {@link IMAPFolder}
     *
     * @param folder for which to retrieve the null-checked array of Messages
     * @param uids to retrieve the messages from the folder
     * @return array of Messages with no null entries
     * @throws MessagingException
     */
    private static javax.mail.Message[] getMessagesByUID(IMAPFolder folder, long[] uids) throws MessagingException {
        return Stream.of(folder.getMessagesByUID(uids)).filter(Objects::nonNull).toArray(javax.mail.Message[]::new);
    }

    private static javax.mail.Message[] getMessagesByUID(IMAPFolder folder, List<Long> uids) throws MessagingException {
        return getMessagesByUID(folder, uids.stream().mapToLong(Long::longValue).toArray());
    }

    private static Properties initMailProperties(@NonNull Credentials credentials, MailSSLSocketFactory mailSSLSocketFactory) {
        final Properties ret = new Properties();
        ret.put("mail.imap.ssl.enable", credentials.getImapSsl());
        ret.put("mail.imap.connectiontimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.imap.connectionpooltimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.imap.ssl.socketFactory", mailSSLSocketFactory);
        ret.put("mail.imap.starttls.enable", true);
        ret.put("mail.imap.starttls.required", false);
        ret.put("mail.imaps.socketFactory", mailSSLSocketFactory);
        ret.put("mail.imaps.socketFactory.fallback", false);
        ret.put("mail.imaps.ssl.socketFactory", mailSSLSocketFactory);
        return ret;
    }

}
