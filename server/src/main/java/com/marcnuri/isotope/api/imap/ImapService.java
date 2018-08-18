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
import com.marcnuri.isotope.api.http.HttpHeaders;
import com.marcnuri.isotope.api.message.Message;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;
import com.sun.mail.imap.IMAPSSLStore;
import com.sun.mail.imap.IMAPStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import javax.annotation.PreDestroy;
import javax.mail.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static javax.mail.Folder.READ_ONLY;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Service
@RequestScope
public class ImapService {

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private static final String IMAPS_PROTOCOL = "imaps";

    private final HttpServletRequest httpServletRequest;

    private CredentialsService credentialsService;

    private IMAPStore imapStore;

    @Autowired
    public ImapService(
            HttpServletRequest httpServletRequest, CredentialsService credentialsService) {

        this.httpServletRequest = httpServletRequest;
        this.credentialsService = credentialsService;
    }

    public List<Folder> getFolders() {
        try {
            final IMAPFolder rootFolder = (IMAPFolder)getImapStore().getDefaultFolder();
            return Stream.of(rootFolder.list())
                    .map(IMAPFolder.class::cast)
                    .map(Folder::from).collect(Collectors.toList());
        } catch (MessagingException | IOException ex) {
            log.error("Error loading folders", ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public List<Message> getMessages(URLName folderId) {
        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore().getFolder(folderId);
            final List<Message> ret = getMessages(folder);
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderId.toString(), ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    public List<Message> getMessages(String folderName) {
        try {
            final IMAPFolder folder = (IMAPFolder)getImapStore().getFolder(folderName);
            final List<Message> ret = getMessages(folder);
            folder.close();
            return ret;
        } catch (MessagingException | IOException ex) {
            log.error("Error loading messages for folder: " + folderName, ex);
            throw  new IsotopeException(ex.getMessage());
        }
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
            getImapStore(credentials).getDefaultFolder();
            return credentialsService.encrypt(credentials);
        } catch (MessagingException | IOException e) {
            throw new IsotopeException("Error while logging in", e);
        }
    }

    private List<Message> getMessages(IMAPFolder folder) throws MessagingException {
        if (!folder.isOpen()) {
            folder.open(READ_ONLY);
        }
        final javax.mail.Message[] messages = folder.getMessages();
        final FetchProfile fp = new FetchProfile();
        fp.add(FetchProfile.Item.ENVELOPE);
        fp.add(UIDFolder.FetchProfileItem.UID);
        folder.fetch(folder.getMessages(), fp);
        fp.add(FetchProfile.Item.FLAGS);
        fp.add(FetchProfile.Item.SIZE);
        folder.fetch(messages, fp);
        return Stream.of(messages)
                .map(m -> Message.from(folder, (IMAPMessage)m))
                .sorted(Comparator.comparingLong(Message::getUID).reversed())
                .collect(Collectors.toList());
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

    private IMAPStore getImapStore() throws IOException, MessagingException {
        final Credentials credentials = credentialsService.decrypt(httpServletRequest.getHeader(HttpHeaders.ISOTOPE_CRDENTIALS),
                httpServletRequest.getHeader(HttpHeaders.ISOTOPE_SALT));
        return getImapStore(credentials);
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

//        ret.put("mail.smtps.socketFactory.port", getMailServerSmtpPort());
//        ret.put("mail.imaps.socketFactory.port", configuration.getImapPort());

        ret.put("mail.smtps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());
        ret.put("mail.imaps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());

        ret.put("mail.smtps.socketFactory.fallback", false);
        ret.put("mail.imaps.socketFactory.fallback", false);

        ret.put("mail.smtps.auth", true);

//        ret.put("mail.smtps.host", getMailServerHost());
//        ret.put("mail.imaps.host", configuration.getImapHost());
        return ret;
    }

}
