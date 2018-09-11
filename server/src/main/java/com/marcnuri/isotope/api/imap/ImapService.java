/*
 * ImapService.java
 *
 * Created on 2018-08-08, 16:34
 */
package com.marcnuri.isotope.api.imap;

import com.marcnuri.isotope.api.configuration.AllowAllSSLSocketFactory;
import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.folder.Folder;
import com.marcnuri.isotope.api.message.Message;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;
import com.sun.mail.imap.IMAPSSLStore;
import com.sun.mail.imap.IMAPStore;
import org.apache.commons.io.IOUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import javax.annotation.PreDestroy;
import javax.mail.*;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static javax.mail.Folder.READ_ONLY;
import static javax.mail.Folder.READ_WRITE;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Service
@RequestScope
public class ImapService {

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private static final String IMAPS_PROTOCOL = "imaps";

    private CredentialsService credentialsService;

    private IMAPStore imapStore;

    @Autowired
    public ImapService(CredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    /**
     * Checks if specified {@link Credentials} are valid and returns a new Credentials object with
     * encrypted values.
     *
     * @param credentials
     * @return
     */
    public Credentials checkCredentials(Credentials credentials) {
        try {
            credentialsService.checkHost(credentials);
            getImapStore(credentials).getDefaultFolder();
            return credentialsService.encrypt(credentials);
        } catch (MessagingException | IOException e) {
            throw new IsotopeException("Error while logging in", e);
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

    public List<Message> getMessages(
            Credentials credentials, URLName folderId, @Nullable Integer start, @Nullable Integer end) {

        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore(credentials).getFolder(folderId);
            final List<Message> ret = getMessages(folder, start, end);
            folder.close();
            return ret;
        } catch (MessagingException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    private List<Message>  getMessages(
            IMAPFolder folder, @Nullable Integer start, @Nullable Integer end) throws MessagingException {

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
        final FetchProfile fp = new FetchProfile();
        fp.add(FetchProfile.Item.ENVELOPE);
        fp.add(UIDFolder.FetchProfileItem.UID);
        fp.add(FetchProfile.Item.FLAGS);
        fp.add(FetchProfile.Item.SIZE);
        folder.fetch(messages, fp);
        return Stream.of(messages)
                .map(m -> Message.from(folder, (IMAPMessage)m))
                .sorted(Comparator.comparingLong(Message::getUid).reversed())
                .collect(Collectors.toList());
    }

    public Message getMessage(Credentials credentials, URLName folderId, Long uid) {
        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore(credentials).getFolder(folderId);
            if (!folder.isOpen()) {
                folder.open(READ_WRITE);
            }
            final IMAPMessage imapMessage = (IMAPMessage)folder.getMessageByUID(uid);
            imapMessage.setFlag(Flags.Flag.SEEN, true);
            final Message ret = Message.from(folder, imapMessage);
            final Object content = imapMessage.getContent();
            if (content instanceof Multipart) {
                ret.setContent(parseMultipart((Multipart) content));
            } else if (content instanceof MimeMessage
                    && ((MimeMessage) content).getContentType().toLowerCase().contains("html")) {
                ret.setContent(content.toString());
            } else {
                //Preserve formatting
                ret.setContent(String.format("<pre>%s</pre>", content.toString()));
            }
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    @PreDestroy
    public void destroy() {
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

//        ret.put("mail.smtps.host", getMailServerHost());
//        ret.put("mail.imaps.host", configuration.getImapHost());
        return ret;
    }

    private static String parseMultipart(Multipart mp)
            throws MessagingException, IOException {
        String ret = null;
        for (int it = 0; it < mp.getCount(); it++) {
            final BodyPart bp = mp.getBodyPart(it);
            if (ret == null && bp.getContentType().toLowerCase().startsWith("text/plain")) {
                ret = bp.getContent().toString();
            }
            if (bp.getContentType().toLowerCase().startsWith("text/html")) {
                ret = (bp.getContent().toString());
            }
            if (bp.getContentType().toLowerCase().startsWith("multipart/")) {
                ret = parseMultipart((Multipart) bp.getContent());
            }
            if (bp.getContentType().toLowerCase().startsWith("image/")
                    && bp instanceof MimeBodyPart
                    && ((MimeBodyPart) bp).getContentID() != null) {
                final String cid = ((MimeBodyPart) bp).getContentID().replace("<", "").replace(">", "");
                if (ret != null && cid != null && ret.contains(cid)) {
                    String contentType = bp.getContentType();
                    if (contentType.contains(";")) {
                        contentType = contentType.substring(0, contentType.indexOf(';'));
                    }
                    final String base64 = Base64.encodeBase64String(IOUtils.toByteArray(bp.getInputStream()))
                            .replace("\r", "").replace("\n", "");

                    ret = ret.replace("cid:" + cid,
                            String.format("data:%s;%s,%s",
                                    contentType,
                                    ((MimeBodyPart) bp).getEncoding(),
                                    base64));
                }
            }
        }
        return ret;
    }
}
