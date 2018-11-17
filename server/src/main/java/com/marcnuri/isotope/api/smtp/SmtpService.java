/*
 * SmtpService.java
 *
 * Created on 2018-10-07, 18:25
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
package com.marcnuri.isotope.api.smtp;

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageUtils;
import com.sun.mail.util.MailSSLSocketFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import javax.activation.DataHandler;
import javax.annotation.PreDestroy;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.marcnuri.isotope.api.message.Message.HEADER_IN_REPLY_TO;
import static com.marcnuri.isotope.api.message.Message.HEADER_REFERENCES;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-10-07.
 */
@Service
@RequestScope
public class SmtpService {

    private static final Logger log = LoggerFactory.getLogger(SmtpService.class);

    private static final String SMTP_PROTOCOL = "smtp";
    private static final String SMTPS_PROTOCOL = "smtps";
    private static final Pattern DATA_URI_IMAGE_PATTERN = Pattern.compile("\"data:(image\\/[^;]*?);base64,([^\\\"]*?)\"");
    private static final String STYLES =
            "body {font-family: 'Roboto', 'Calibri',  sans-serif; font-size: 1rem; color: #333}" +
            "h1 {margin: 6px 0 16px 0; font-size: 3rem; font-weight: normal}" +
            "h2 {margin: 6px 0 12px 0; font-size: 2.5rem; font-weight: normal}" +
            "h3 {margin: 6px 0 8px 0; font-size: 1.5rem; font-weight: bold}" +
            "blockquote {border-left: 5px solid #ebebeb; font-style: italic; margin: 0; padding: 0 32px}" +
            "pre.code {background-color: #ebebeb; margin: 0; padding: 8px}";

    private final MailSSLSocketFactory mailSSLSocketFactory;

    private Session session;
    private Transport smtpTransport;

    @Autowired
    public SmtpService(MailSSLSocketFactory mailSSLSocketFactory) {
        this.mailSSLSocketFactory = mailSSLSocketFactory;
    }

    public void sendMessage(Credentials credentials, Message message) {
        try {
            final MimeMessage mimeMessage = new MimeMessage(getSession(credentials));
            mimeMessage.setSentDate(new Date());
            if (credentials.getUser() != null && credentials.getUser().contains("@")) {
                mimeMessage.setFrom(credentials.getUser());
            } else {
                mimeMessage.setFrom(String.format("%s@%s", credentials.getUser(), credentials.getServerHost()));
            }
            for (javax.mail.Message.RecipientType type : new javax.mail.Message.RecipientType[]{
                    MimeMessage.RecipientType.TO, MimeMessage.RecipientType.CC, MimeMessage.RecipientType.BCC
            }) {
                mimeMessage.setRecipients(type, MessageUtils.getRecipientAddresses(message, type));
            }
            mimeMessage.setSubject(message.getSubject(), StandardCharsets.UTF_8.name());

            if (message.getInReplyTo() != null) {
                mimeMessage.setHeader(HEADER_IN_REPLY_TO, String.join(" ", message.getInReplyTo()));
            }
            if (message.getReferences() != null) {
                mimeMessage.setHeader(HEADER_REFERENCES, String.join(" ", message.getReferences()));
            }

            final MimeMultipart multipart = new MimeMultipart();

            // Extract data-uri images to inline attachments
            final String originalContent = message.getContent();
            String finalContent = originalContent;
            final Matcher matcher = DATA_URI_IMAGE_PATTERN.matcher(originalContent);
            while(matcher.find()) {
                final String cid = UUID.randomUUID().toString().replace("-", "");
                final String contentType = matcher.group(1);
                final InternetHeaders headers = new InternetHeaders();
                headers.addHeader("Content-Type", contentType);
                headers.addHeader("Content-Transfer-Encoding", "base64");
                final MimeBodyPart cidImagePart = new MimeBodyPart(headers, matcher.group(2).getBytes());
                multipart.addBodyPart(cidImagePart);
                cidImagePart.setDisposition(MimeBodyPart.INLINE);
                cidImagePart.setContentID(String.format("<%s>",cid));
                cidImagePart.setFileName(String.format("%s.%s", cid, contentType.substring(contentType.indexOf('/') + 1)));
                finalContent = finalContent.replace(matcher.group(), "\"cid:" +cid +"\"");
            }

            // Include attachments
            if (message.getAttachments() != null && !message.getAttachments().isEmpty()) {
                for (Attachment attachment : message.getAttachments()) {
                    multipart.addBodyPart(toBodyPart(attachment));
                }
            }

            // Create body part
            final MimeBodyPart body = new MimeBodyPart();
            multipart.addBodyPart(body);
            body.setContent(new String(String.format("<html><head><style>%1$s</style></head><body><div id='scoped'>"
                            + "<style type='text/css' scoped>%1$s</style>%2$s</div></body></html>",
                            STYLES, finalContent).getBytes(), StandardCharsets.UTF_8),
                    String.format("%s; charset=\"%s\"", MediaType.TEXT_HTML_VALUE, StandardCharsets.UTF_8.name()));
            mimeMessage.setContent(multipart);

            mimeMessage.saveChanges();
            getSmtpTransport(credentials).sendMessage(mimeMessage, mimeMessage.getAllRecipients());
        } catch(MessagingException ex) {
            throw new IsotopeException("Problem sending message", ex);
        }
    }


    @PreDestroy
    public void destroy() {
        log.debug("SmtpService destroyed");
        if(smtpTransport != null) {
            try {
                smtpTransport.close();
            } catch (MessagingException ex) {
                log.error("Error closing SMTP Transport", ex);
            }
        }
    }

    private Session getSession(Credentials credentials) {
        if (session == null) {
            session = Session.getInstance(initMailProperties(credentials, mailSSLSocketFactory), null);
        }
        return session;
    }

    private Transport getSmtpTransport(Credentials credentials) throws MessagingException {
        if (smtpTransport == null) {
            smtpTransport = getSession(credentials).getTransport(credentials.getSmtpSsl() ? SMTPS_PROTOCOL : SMTP_PROTOCOL);
            final String smtpHost = credentials.getSmtpHost();
            smtpTransport.connect(
                    smtpHost != null && !smtpHost.isEmpty() ? smtpHost : credentials.getServerHost(),
                    credentials.getSmtpPort(),
                    credentials.getUser(),
                    credentials.getPassword());
            log.debug("Opened new SMTP transport");
        }
        return smtpTransport;
    }

    private static Properties initMailProperties(Credentials credentials, MailSSLSocketFactory socketFactory) {
        final Properties ret = new Properties();
        ret.put("mail.smtp.ssl.enable", credentials.getSmtpSsl());
        ret.put("mail.smtp.ssl.socketFactory", socketFactory);
        ret.put("mail.smtp.starttls.enable", true);
        ret.put("mail.smtp.starttls.required", false);
        ret.put("mail.smtps.socketFactory", socketFactory);
        ret.put("mail.smtps.ssl.socketFactory", socketFactory);
        ret.put("mail.smtps.socketFactory.fallback", false);
        ret.put("mail.smtps.auth", true);
        return ret;
    }

    private static MimeBodyPart toBodyPart(Attachment attachment) throws MessagingException {
        final MimeBodyPart mimeAttachment = new MimeBodyPart();
        mimeAttachment.setDisposition(MimeBodyPart.ATTACHMENT);
        final String mimeType = attachment.getContentType() != null && !attachment.getContentType().isEmpty() ?
                attachment.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        mimeAttachment.setDataHandler(new DataHandler(
                new ByteArrayDataSource(attachment.getContent(), mimeType)));
        mimeAttachment.setFileName(attachment.getFileName());
        return mimeAttachment;
    }
}
