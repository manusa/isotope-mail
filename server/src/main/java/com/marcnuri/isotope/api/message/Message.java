/*
 * Message.java
 *
 * Created on 2018-08-10, 16:07
 */
package com.marcnuri.isotope.api.message;

import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.resource.IsotopeResource;
import com.sun.mail.imap.IMAPMessage;

import javax.mail.*;
import javax.mail.Message.RecipientType;
import javax.mail.internet.InternetAddress;
import java.io.Serializable;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-10.
 */
@SuppressWarnings({"WeakerAccess", "unused"})
public class Message extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = -1068972394742882009L;

    private static final String CET_ZONE_ID = "CET";

    private Long uid;
    private List<String> from;
    private List<Recipient> recipients;
    private String subject;
    private ZonedDateTime receivedDate;
    private Long size;
    private Boolean seen;
    private Boolean recent;
    private Boolean deleted;
    private String content;
    private List<Attachment> attachments;

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public List<String> getFrom() {
        return from;
    }

    public void setFrom(List<String> from) {
        this.from = from;
    }

    public List<Recipient> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<Recipient> recipients) {
        this.recipients = recipients;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public ZonedDateTime getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(ZonedDateTime receivedDate) {
        this.receivedDate = receivedDate;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public Boolean getSeen() {
        return seen;
    }

    public void setSeen(Boolean seen) {
        this.seen = seen;
    }

    public Boolean getRecent() {
        return recent;
    }

    public void setRecent(Boolean recent) {
        this.recent = recent;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Message message = (Message) o;
        return Objects.equals(uid, message.uid) &&
                Objects.equals(from, message.from) &&
                Objects.equals(recipients, message.recipients) &&
                Objects.equals(subject, message.subject) &&
                Objects.equals(receivedDate, message.receivedDate) &&
                Objects.equals(size, message.size) &&
                Objects.equals(seen, message.seen) &&
                Objects.equals(recent, message.recent) &&
                Objects.equals(deleted, message.deleted) &&
                Objects.equals(content, message.content) &&
                Objects.equals(attachments, message.attachments);
    }

    @Override
    public int hashCode() {

        return Objects.hash(super.hashCode(), uid, from, recipients, subject, receivedDate, size, seen, recent, deleted, content, attachments);
    }

    /**
     * Maps an {@link com.sun.mail.imap.IMAPStore} to a {@link Message}.
     *
     * This method should only map those fields that are retrieved performed an IMAP fetch command (ENVELOPE,
     * UID, FLAGS...)
     *
     * To map other fields use a separate method.
     *
     * @param folder
     * @param imapMessage
     * @return
     */
    public static <F extends Folder & UIDFolder> Message from(F folder, IMAPMessage imapMessage) {
        final Message ret;
        if (imapMessage != null) {
            ret = new Message();
            try {
                ret.setUid(folder.getUID(imapMessage));
                ret.setFrom(processAddress(imapMessage.getFrom()));
                // Process only recipients received in ENVELOPE (don't use getAllRecipients)
                ret.setRecipients(Stream.of(
                        processAddress(RecipientType.TO, imapMessage.getRecipients(RecipientType.TO)),
                        processAddress(RecipientType.CC, imapMessage.getRecipients(RecipientType.CC)),
                        processAddress(RecipientType.BCC, imapMessage.getRecipients(RecipientType.BCC))
                ).flatMap(Collection::stream).collect(Collectors.toList()));
                ret.setSubject(imapMessage.getSubject());
                ret.setReceivedDate(imapMessage.getReceivedDate().toInstant().atZone(ZoneId.of(CET_ZONE_ID)));
                ret.setSize(imapMessage.getSizeLong());
                final Flags flags = imapMessage.getFlags();
                ret.setSeen(flags.contains(Flags.Flag.SEEN));
                ret.setRecent(flags.contains(Flags.Flag.RECENT));
                ret.setDeleted(flags.contains(Flags.Flag.DELETED));
            } catch (MessagingException e) {
                throw new IsotopeException("Error parsing IMAP Message");
            }
        } else {
            ret = null;
        }
        return ret;
    }

    private static List<Recipient> processAddress(RecipientType recipient, Address... addresses) {
        return processAddress(addresses).stream()
                .map(a -> new Recipient(recipient.toString(), a))
                .collect(Collectors.toList());
    }

    private static List<String> processAddress(Address... addresses) {
        return Stream.of(Optional.ofNullable(addresses).orElse(new Address[0]))
                .map(address -> {
                    if (address instanceof InternetAddress) {
                        final InternetAddress internetAddress = (InternetAddress) address;
                        return internetAddress.getPersonal() == null ? internetAddress.getAddress() :
                                String.format("\"%s\" <%s>", internetAddress.getPersonal(), internetAddress.getAddress());
                    } else {
                        return address.toString();
                    }
                })
                .collect(Collectors.toList());
    }
}
