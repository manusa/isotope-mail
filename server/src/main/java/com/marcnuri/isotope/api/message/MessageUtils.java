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

import com.marcnuri.isotope.api.exception.InvalidFieldException;
import org.apache.commons.io.IOUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.util.HtmlUtils;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import java.io.IOException;

import static com.marcnuri.isotope.api.imap.ImapService.MULTIPART_MIME_TYPE;

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

    /**
     * Returns an array of {@link Address} for the provided {@link javax.mail.Message.RecipientType}
     *
     * @param message from which to extract Addresses
     * @param type of recipients to extract
     * @return Address array containing the recipients of the specified type
     */
    public static Address[] getRecipientAddresses(Message message, javax.mail.Message.RecipientType type) {
        if (message.getRecipients() == null || message.getRecipients().isEmpty()) {
            return new Address[0];
        }
        return message.getRecipients().stream()
                .filter(r -> type.toString().equals(r.getType()))
                .map(r -> {
                    try {
                        return new InternetAddress(r.getAddress());
                    } catch(AddressException ex) {
                        throw new InvalidFieldException("Problem parsing address " + r.getAddress(), ex);
                    }
                })
                .toArray(InternetAddress[]::new);
    }

    /**
     * Extracts e-mail message content (body) from the provided {@link Multipart} body container.
     *
     * Multipart is processed recursively in order to find valid html or text e-mail content. Last body part
     * with valid html will be used. Any found text/plain body will be returned as fallback.
     *
     * TODO: Check this is the right approach
     *
     * @param multipart to process and extract body
     * @return
     * @throws MessagingException
     * @throws IOException
     */
    public static String extractContent(@NonNull Multipart multipart) throws MessagingException, IOException {
        String ret = "";
        for (int it = 0; it < multipart.getCount(); it++) {
            final BodyPart bp = multipart.getBodyPart(it);
            if ((ret == null || ret.isEmpty())
                    && bp.getContentType().toLowerCase().startsWith(MediaType.TEXT_PLAIN_VALUE)) {
                ret = String.format("<pre>%s</pre>", HtmlUtils.htmlEscape(bp.getContent().toString()));
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
     * Extract a {@link BodyPart} from the provided {@link Multipart} matching the given id.
     *
     * @param mp
     * @param id
     * @param contentId
     * @return
     * @throws MessagingException
     * @throws IOException
     */
    @Nullable public static BodyPart extractBodypart(@NonNull Multipart mp, @NonNull String id, Boolean contentId)
            throws MessagingException, IOException {

        return Boolean.TRUE.equals(contentId) ?
                extractEmbeddedBodypart(mp, id) : // Embedded contentId
                extractAttachmentBodypart(mp, id); // Attachment
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
    public static String replaceEmbeddedImage(@Nullable String content, @NonNull MimeBodyPart imageBodyPart)
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

    /**
     * Extracts a {@link BodyPart} form a {@link Multipart} body for an <b>image</b> matching the provided contentId
     *
     * @param multipart to extract the BodyPart from
     * @param contentId of the image for which the BodyPart must be extracted
     * @return the BodyPart for the image with the given contentId or null if not found
     * @throws MessagingException for any IMAP exception
     * @throws IOException for IO problems when reading the content
     */
    @Nullable private static BodyPart extractEmbeddedBodypart(@NonNull Multipart multipart, @NonNull String contentId)
            throws MessagingException, IOException {

        for (int it = 0; it < multipart.getCount(); it++) {
            final BodyPart bp = multipart.getBodyPart(it);
            if (bp.getContentType().toLowerCase().startsWith(MULTIPART_MIME_TYPE)) {
                final BodyPart nestedBodyPart = extractEmbeddedBodypart((Multipart) bp.getContent(), contentId);
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

    /**
     * Extracts a {@link BodyPart} form a {@link Multipart} body for an <b>attachment</b> matching the provided id
     *
     * @param multipart to extract the BodyPart from
     * @param id of the attachment for which the BodyPart must be extracted
     * @return the BodyPart for the attachment with the given id or null if not found
     * @throws MessagingException for any IMAP exception
     * @throws IOException for IO problems when reading the content
     */
    @Nullable private static BodyPart extractAttachmentBodypart(@NonNull Multipart multipart, @NonNull String id)
            throws MessagingException, IOException {

        for (int it = 0; it < multipart.getCount(); it++) {
            final BodyPart bp = multipart.getBodyPart(it);
            if (bp.getDisposition() != null && Part.ATTACHMENT.equalsIgnoreCase(bp.getDisposition())) {
                // Regular file
                if (id.equals(MimeUtility.decodeText(bp.getFileName()))) {
                    return bp;
                }
                // Embedded message
                if(bp.getContentType().toLowerCase().startsWith("message/") && bp.getContent() instanceof MimeMessage
                        && ((MimeMessage)bp.getContent()).getSubject().equals(id)) {
                    return bp;
                }
            }
        }
        return null;
    }
}
