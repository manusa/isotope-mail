/*
 * ImapService.java
 *
 * Created on 2018-08-08, 16:34
 */
package com.marcnuri.mailclient.api.imap;

import com.marcnuri.mailclient.api.configuration.AllowAllSSLSocketFactory;
import com.marcnuri.mailclient.api.configuration.MailClientApiConfiguration;
import com.marcnuri.mailclient.api.exception.MailClientException;
import com.marcnuri.mailclient.api.folder.Folder;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPSSLStore;
import com.sun.mail.imap.IMAPStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.Session;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-08.
 */
@Service
public class ImapService {

    private static final String IMAPS_PROTOCOL = "imaps";

    private static final Logger log = LoggerFactory.getLogger(ImapService.class);

    private final MailClientApiConfiguration configuration;

    @Autowired
    public ImapService(MailClientApiConfiguration configuration) {
        this.configuration = configuration;
    }

    public List<Folder> getFolders() {
        try {
            final IMAPStore imapStore = getImapStore();
            IMAPFolder rootFolder = (IMAPFolder)imapStore.getDefaultFolder();
            final List<Folder> ret = Stream.of(rootFolder.list()).map(Folder::from).collect(Collectors.toList());
            imapStore.close();
            return ret;
        } catch (MessagingException ex) {
            log.error("Error loading folders", ex);
            throw  new MailClientException(ex.getMessage());
        }
    }

    private IMAPStore getImapStore() throws MessagingException {
        final Session session = Session.getInstance(initMailProperties(), null);
        final IMAPStore imapStore = (IMAPSSLStore)session.getStore(IMAPS_PROTOCOL);
        imapStore.connect(
                configuration.getImapHost(),
                configuration.getImapPort(),
                configuration.getImapUser(),
                configuration.getImapPassword());
        return imapStore;
    }

    private final Properties initMailProperties() {
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
