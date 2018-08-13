/*
 * Message.java
 *
 * Created on 2018-08-10, 16:07
 */
package com.marcnuri.isotope.api.message;

import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.resource.IsotopeResource;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPMessage;

import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import java.io.Serializable;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-10.
 */
public class Message extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = -1068972394742882009L;

    private static final String CET_ZONE_ID = "CET";

    private Long UID;
    private List<String> from;
    private String subject;
    private ZonedDateTime receivedDate;
    private Long size;
    private Boolean seen;
    private Boolean recent;
    private Boolean deleted;

    public Long getUID() {
        return UID;
    }

    public void setUID(Long UID) {
        this.UID = UID;
    }

    public List<String> getFrom() {
        return from;
    }

    public void setFrom(List<String> from) {
        this.from = from;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Message message = (Message) o;
        return Objects.equals(UID, message.UID) &&
                Objects.equals(from, message.from) &&
                Objects.equals(subject, message.subject) &&
                Objects.equals(receivedDate, message.receivedDate) &&
                Objects.equals(size, message.size) &&
                Objects.equals(seen, message.seen) &&
                Objects.equals(recent, message.recent) &&
                Objects.equals(deleted, message.deleted);
    }

    @Override
    public int hashCode() {

        return Objects.hash(super.hashCode(), UID, from, subject, receivedDate, size, seen, recent, deleted);
    }

    public static Message from(IMAPFolder folder, IMAPMessage imapMessage) {
        final Message ret;
        if (imapMessage != null) {
            ret = new Message();
            try {
                ret.setUID(folder.getUID(imapMessage));
                ret.setFrom(processAddress(imapMessage.getFrom()));
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

    private static List<String> processAddress(Address... addresses) {
        return Stream.of(addresses)
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
