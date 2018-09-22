/*
 * ImapService.java
 *
 * Created on 2018-08-08, 16:34
 */
package com.marcnuri.isotope.api.imap;

import com.marcnuri.isotope.api.configuration.AllowAllSSLSocketFactory;
import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.exception.AuthenticationException;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.exception.NotFoundException;
import com.marcnuri.isotope.api.folder.Folder;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageWithFolder;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;
import com.sun.mail.imap.IMAPSSLStore;
import com.sun.mail.imap.IMAPStore;
import org.apache.commons.io.IOUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;
import reactor.core.publisher.Flux;

import javax.annotation.PreDestroy;
import javax.mail.*;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.folder.Folder.toBase64Id;
import static com.marcnuri.isotope.api.folder.FolderResource.addLinks;
import static com.marcnuri.isotope.api.message.MessageUtils.envelopeFetch;
import static javax.mail.Folder.READ_ONLY;
import static javax.mail.Folder.READ_WRITE;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Service
@RequestScope
@Primary
public class ImapService {

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private static final String IMAPS_PROTOCOL = "imaps";
    private static final String IMAP_CAPABILITY_CONDSTORE = "CONDSTORE";
    private static final String MULTIPART_MIME_TYPE = "multipart/";
    private static final int DEFAULT_INITIAL_MESSAGES_BATCH_SIZE = 20;
    private static final int DEFAULT_MAX_MESSAGES_BATCH_SIZE = 640;

    private final IsotopeApiConfiguration isotopeApiConfiguration;

    private CredentialsService credentialsService;

    private IMAPStore imapStore;

    @Autowired
    public ImapService(IsotopeApiConfiguration isotopeApiConfiguration, CredentialsService credentialsService) {
        this.isotopeApiConfiguration = isotopeApiConfiguration;
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
            throw new AuthenticationException("Error while logging in", e);
        }
    }

    public List<Folder> getFolders(Credentials credentials, @Nullable  Boolean loadChildren) {
        try {
            final IMAPFolder rootFolder = (IMAPFolder)getImapStore(credentials).getDefaultFolder();
            return Stream.of(rootFolder.list())
                    .map(IMAPFolder.class::cast)
                    .map(mf -> Folder.from(mf, loadChildren))
                    .collect(Collectors.toList());
        } catch (MessagingException ex) {
            log.error("Error loading folders", ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public Flux<ServerSentEvent<List<Message>>> getMessagesFlux(
            Credentials credentials, URLName folderId, HttpServletResponse response) {

        return Flux.create(s -> {
            try {
                final IMAPStore store = getImapStore(credentials);
                final boolean fetchModseq = store.hasCapability(IMAP_CAPABILITY_CONDSTORE);
                final IMAPFolder folder = (IMAPFolder)store.getFolder(folderId);
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
                                .builder(getMessages(folder, start, end, fetchModseq))
                                .id(String.valueOf(start))
                                .build();
                        s.next(event);
                        end = start - 1;
                        batchSize = (batchSize * 2 ) > DEFAULT_MAX_MESSAGES_BATCH_SIZE ? DEFAULT_MAX_MESSAGES_BATCH_SIZE :
                                batchSize * 2;
                    } while (end > 0 && !s.isCancelled());
                } catch(IOException ex) {
                    log.debug("Response stream has already been closed ({})", ex.getMessage());
                    s.error(ex);
                }
                folder.close();
            } catch (MessagingException ex) {
                log.error("Error loading messages for folder: " + folderId.toString(), ex);
                s.error(ex);
                destroy();
                s.complete();
                throw  new IsotopeException(ex.getMessage());
            }
            // This bean will be effectively a Prototype, must manually disconnect
            destroy();
            s.complete();
        });
    }

    public MessageWithFolder getMessage(Credentials credentials, URLName folderId, Long uid) {
        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore(credentials).getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_WRITE);
            }
            final IMAPMessage imapMessage = (IMAPMessage)folder.getMessageByUID(uid);
            if (imapMessage == null) {
                folder.close();
                throw new NotFoundException("Message not found");
            }
            imapMessage.setFlag(Flags.Flag.SEEN, true);
            final MessageWithFolder ret = MessageWithFolder.from(folder, imapMessage);
            final Object content = imapMessage.getContent();
            if (content instanceof Multipart) {
                ret.setContent(extractContent((Multipart) content));
                ret.setAttachments(addLinks(toBase64Id(folderId), ret,
                        extractAttachments(ret, (Multipart) content, null)));
            } else if (content instanceof MimeMessage
                    && ((MimeMessage) content).getContentType().toLowerCase().contains("html")) {
                ret.setContent(content.toString());
            } else if (imapMessage.getContentType().indexOf(MediaType.TEXT_HTML_VALUE) == 0){
                ret.setContent(content.toString());
            } else {
                //Preserve formatting
                ret.setContent(content.toString()
                        .replace("\r\n", "<br />" )
                        .replaceAll("[\\r\\n]", "<br />"));
            }
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public void readAttachment(
            HttpServletResponse response, Credentials credentials, URLName folderId, Long messageId,
            String id, Boolean isContentId) {
        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore(credentials).getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_ONLY);
            }
            final IMAPMessage imapMessage = (IMAPMessage)folder.getMessageByUID(messageId);
            final Object content = imapMessage.getContent();
            if (content instanceof Multipart) {
                final BodyPart bp = getBodypart((Multipart)content, id, isContentId);
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
     * @param credentials to authenticate the user in the IMAP server
     * @param fromFolderId name of the originating folder
     * @param toFolderId name of the target folder
     * @param uids list of uids to move
     * @return list of new messages in the target folder since the move operation started (may include additional messages)
     */
    public List<MessageWithFolder> moveMessages(Credentials credentials, URLName fromFolderId, URLName toFolderId, List<Long> uids) {
        try {
            final IMAPFolder fromFolder = (IMAPFolder)getImapStore(credentials).getFolder(fromFolderId);
            fromFolder.open(READ_WRITE);
            final IMAPFolder toFolder = (IMAPFolder)getImapStore(credentials).getFolder(toFolderId);
            toFolder.open(READ_ONLY);
            long toFolderNextUID = toFolder.getUIDNext();
            toFolder.close(false);

            // Maximize IMAP compatibility, perform COPY and DELETE
            final javax.mail.Message[] messagesToMove = Stream.of(fromFolder.getMessagesByUID(
                    uids.stream().mapToLong(Long::longValue).toArray()))
                    .filter(Objects::nonNull)
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

    private IMAPStore getImapStore(Credentials credentials) throws MessagingException {
        if (imapStore == null) {
            final Session session = Session.getInstance(initMailProperties(), null);
            imapStore = (IMAPSSLStore) session.getStore(IMAPS_PROTOCOL);
            imapStore.connect(
                    credentials.getServerHost(),
                    credentials.getServerPort(),
                    credentials.getUser(),
                    credentials.getPassword());
            log.debug("Opened new ImapStore session");
        }
        return imapStore;
    }

    private Properties initMailProperties() {
        final Properties ret = new Properties();
        ret.put("mail.smtp.ssl.enable", true);
        ret.put("mail.imap.ssl.enable", true);
        ret.put("mail.smtp.starttls.enable", true);
        ret.put("mail.imap.starttls.enable", true);

        ret.put("mail.smtps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());
        ret.put("mail.imaps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());

        ret.put("mail.smtps.socketFactory.fallback", false);
        ret.put("mail.imaps.socketFactory.fallback", false);

        ret.put("mail.smtps.auth", true);

        return ret;
    }

    private List<Message> getMessages(
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
                .map(m -> {
                    m.setModseq(highestModseq);
                    return m;
                })
                .sorted(Comparator.comparingLong(Message::getUid).reversed())
                .collect(Collectors.toList());
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
            if (bp.getContentType().toLowerCase().startsWith(MULTIPART_MIME_TYPE)) {
                extractAttachments(finalMessage, (Multipart) bp.getContent(), attachments);
            }
            if (bp.getContentType().toLowerCase().startsWith("image/")
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
            if (bp.getDisposition() != null && bp.getDisposition().equalsIgnoreCase(Part.ATTACHMENT)) {
                attachments.add(new Attachment(null, bp.getFileName(), bp.getContentType(), bp.getSize()));
            }
        }
        return attachments;
    }

    private static BodyPart getBodypart(@NonNull Multipart mp, @NonNull String id, Boolean contentId)
            throws MessagingException, IOException {

        // Embedded contentId
        if (Boolean.TRUE.equals(contentId)) {
            return getEmbeddedBodypart(mp, id);
        }
        // Attachment
        else {
            for (int it = 0; it < mp.getCount(); it++) {
                final BodyPart bp = mp.getBodyPart(it);
                if (bp.getDisposition() != null && Part.ATTACHMENT.equalsIgnoreCase(bp.getDisposition())
                        && id.equals(bp.getFileName())) {
                    return bp;
                }
            }
        }
        return null;
    }

    private static BodyPart getEmbeddedBodypart(@NonNull Multipart mp, @NonNull String contentId)
            throws MessagingException, IOException {

        for (int it = 0; it < mp.getCount(); it++) {
            final BodyPart bp = mp.getBodyPart(it);
            if (bp.getContentType().toLowerCase().startsWith(MULTIPART_MIME_TYPE)) {
                final BodyPart nestedBodyPart = getEmbeddedBodypart((Multipart) bp.getContent(), contentId);
                if (nestedBodyPart != null){
                    return nestedBodyPart;
                }
            }
            if (bp.getContentType().toLowerCase().startsWith("image/") && bp instanceof MimeBodyPart
                    && contentId.equals(((MimeBodyPart) bp).getContentID())) {
                return bp;
            }
        }
        return null;
    }

    private static String extractContent(@NonNull Multipart mp)
            throws MessagingException, IOException {

        String ret = "";
        for (int it = 0; it < mp.getCount(); it++) {
            final BodyPart bp = mp.getBodyPart(it);
            if (ret == null && bp.getContentType().toLowerCase().startsWith(MediaType.TEXT_PLAIN_VALUE)) {
                ret = bp.getContent().toString();
            }
            if (bp.getContentType().toLowerCase().startsWith(MediaType.TEXT_HTML_VALUE)) {
                ret = (bp.getContent().toString());
            }
            if (bp.getContentType().toLowerCase().startsWith(MULTIPART_MIME_TYPE)) {
                ret = extractContent((Multipart) bp.getContent());
            }
        }
        return ret;
    }

    /**
     * Replaces content image cid urls (<code>&lt;img src='cid:1234' /&gt;</code>) by Base64 data urls for every occurrence
     * of the provided {@link MimeBodyPart}.
     *
     * If no occurrences are found, same content is returned.
     *
     * @param content e-mail message content to replace cid urls
     * @param imageBodyPart body part of the replaceable cid url
     * @return a string with the original content with replaced image cid urls
     * @throws MessagingException for javax.mail failures
     * @throws IOException for IO failures
     */
    private static String replaceEmbeddedImage(String content, MimeBodyPart imageBodyPart)
            throws MessagingException, IOException {

        final String cid = imageBodyPart.getContentID().replaceAll("[<>]", "");
        if (content != null && content.contains(cid)) {
            String contentType = imageBodyPart.getContentType();
            if (contentType.contains(";")) {
                contentType = contentType.substring(0, contentType.indexOf(';'));
            }
            final String base64 = Base64.encodeBase64String(IOUtils.toByteArray(imageBodyPart.getInputStream()))
                    .replace("\r", "").replace("\n", "");
            return content.replace("cid:" + cid,
                    String.format("data:%s;%s,%s",
                            contentType,
                            imageBodyPart.getEncoding(),
                            base64));
        }
        return content;
    }

}
