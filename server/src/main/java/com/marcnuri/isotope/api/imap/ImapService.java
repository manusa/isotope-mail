/*
 * ImapService.java
 *
 * Created on 2018-08-08, 16:34
 */
package com.marcnuri.isotope.api.imap;

import com.marcnuri.isotope.api.configuration.AllowAllSSLSocketFactory;
import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.folder.Folder;
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
import javax.mail.FetchProfile;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.URLName;
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

    private static final String IMAPS_PROTOCOL = "imaps";

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private final IsotopeApiConfiguration configuration;

    private IMAPStore imapStore;

    @Autowired
    public ImapService(IsotopeApiConfiguration configuration) {
        this.configuration = configuration;
    }

    public List<Folder> getFolders() {
        try {
            final IMAPFolder rootFolder = (IMAPFolder)getImapStore().getDefaultFolder();
            return Stream.of(rootFolder.list())
                    .map(IMAPFolder.class::cast)
                    .map(Folder::from).collect(Collectors.toList());
        } catch (MessagingException ex) {
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
        } catch (MessagingException ex) {
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
        } catch (MessagingException ex) {
            log.error("Error loading messages for folder: " + folderName, ex);
            throw  new IsotopeException(ex.getMessage());
        }
    }

    private List<Message> getMessages(IMAPFolder folder) throws MessagingException {
        if (!folder.isOpen()) {
            folder.open(READ_ONLY);
        }
        final int returnedMessages = 40;
        final javax.mail.Message[] messages = folder.getMessages(folder.getMessageCount() <= returnedMessages ?
                1 : folder.getMessageCount() - returnedMessages, folder.getMessageCount());
        final FetchProfile fp = new FetchProfile();
        fp.add(FetchProfile.Item.ENVELOPE);
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

    private IMAPStore getImapStore() throws MessagingException {
        if (imapStore == null) {
            final Session session = Session.getInstance(initMailProperties(), null);
            imapStore = (IMAPSSLStore) session.getStore(IMAPS_PROTOCOL);
            imapStore.connect(
                    configuration.getImapHost(),
                    configuration.getImapPort(),
                    configuration.getImapUser(),
                    configuration.getImapPassword());
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
        ret.put("mail.imaps.socketFactory.port", configuration.getImapPort());

        ret.put("mail.smtps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());
        ret.put("mail.imaps.socketFactory.class", AllowAllSSLSocketFactory.class.getName());

        ret.put("mail.smtps.socketFactory.fallback", false);
        ret.put("mail.imaps.socketFactory.fallback", false);

        ret.put("mail.smtps.auth", true);

//        ret.put("mail.smtps.host", getMailServerHost());
        ret.put("mail.imaps.host", configuration.getImapHost());
        return ret;
    }
}
