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

import javax.mail.MessagingException;
import java.io.Serializable;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-10.
 */
public class Message extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = -1068972394742882009L;

    private Long UID;
    private String subject;

    public Long getUID() {
        return UID;
    }

    public void setUID(Long UID) {
        this.UID = UID;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public static Message from(IMAPFolder folder, IMAPMessage imapMessage) {
        final Message ret;
        if (imapMessage != null) {
            ret = new Message();
            try {
                ret.setUID(folder.getUID(imapMessage));
                ret.setSubject(imapMessage.getSubject());
            } catch (MessagingException e) {
                throw new IsotopeException("Error parsing IMAP Message");
            }
        } else {
            ret = null;
        }
        return ret;
    }
}
