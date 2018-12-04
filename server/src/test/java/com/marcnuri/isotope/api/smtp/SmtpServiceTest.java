/*
 * SmtpServiceTest.java
 *
 * Created on 2018-11-16, 6:52
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
import com.marcnuri.isotope.api.exception.AuthenticationException;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.sun.mail.util.MailSSLSocketFactory;
import org.hamcrest.FeatureMatcher;
import org.hamcrest.Matcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.util.Arrays;
import java.util.Collections;
import java.util.Properties;

import static com.marcnuri.isotope.api.smtp.SmtpServiceTest.HeaderMatcher.headerMatches;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.*;
import static org.powermock.api.mockito.PowerMockito.doReturn;
import static org.powermock.api.mockito.PowerMockito.when;


/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-11-16.
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({Session.class, Transport.class})
public class SmtpServiceTest {

    private Session mockedSession;
    private Transport mockedTransport;
    private SmtpService smtpService;

    @Before
    public void setUp() throws Exception {
        PowerMockito.mockStatic(Session.class);
        mockedSession = Mockito.mock(Session.class);
        mockedTransport = Mockito.mock(Transport.class);
        when(Session.getInstance(Mockito.any(), Mockito.any())).thenReturn(mockedSession);
        doReturn(mockedTransport).when(mockedSession).getTransport(Mockito.anyString());
        doReturn(new Properties()).when(mockedSession).getProperties();

        smtpService = new SmtpService(Mockito.mock(MailSSLSocketFactory.class));
    }

    @After
    public void tearDown() {
        mockedTransport = null;
        mockedSession = null;

        smtpService = null;
    }

    @Test
    public void destroy_notStarted_shouldNotFail() {
        // Given
        // Initial conditions

        // When
        smtpService.destroy();

        // Then
        // No exception is thrown
    }

    @Test
    public void checkCredentials_validCredentials_shouldNotFail() {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("valid");
        credentials.setServerHost("email.com");
        credentials.setSmtpSsl(true);
        credentials.setSmtpPort(1);

        // When
        smtpService.checkCredentials(credentials);

        // Then
        // No exception is thrown
    }

    @Test(expected = AuthenticationException.class)
    public void checkCredentials_invalidCredentials_shouldThrowException() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("invalid");
        credentials.setServerHost("email.com");
        credentials.setSmtpSsl(true);
        credentials.setSmtpPort(1);
        doThrow(new MessagingException()).when(mockedTransport).connect(
                Mockito.eq(credentials.getServerHost()), Mockito.eq(credentials.getSmtpPort()),
                Mockito.eq(credentials.getUser()), Mockito.eq(credentials.getPassword()));

        // When
        smtpService.checkCredentials(credentials);

        // Then
        fail();
    }

    @Test
    public void sendMessageTestFrom_userWithNoDomain_shouldAppendDomainInFrom() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("test");
        credentials.setServerHost("email.com");
        credentials.setSmtpSsl(true);
        credentials.setSmtpPort(1);

        final Message message = new Message();
        message.setSubject("");
        message.setContent("");
        message.setRecipients(Collections.emptyList());
        message.setAttachments(Collections.emptyList());

        final ArgumentCaptor<MimeMessage> mimeMessage = ArgumentCaptor.forClass(MimeMessage.class);

        // When
        smtpService.sendMessage(new MockHttpServletRequest(), credentials, message);

        // Then
        verify(mockedTransport, times(1)).sendMessage(mimeMessage.capture(), Mockito.any());
        assertThat(mimeMessage.getValue().getFrom(), array(hasProperty("address", is("test@email.com"))));
    }

    @Test
    public void sendMessageTestFrom_userWithDomain_shouldNotAppendDomainInFrom() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("test@email.com");
        credentials.setServerHost("mail.email.com");
        credentials.setSmtpSsl(true);
        credentials.setSmtpPort(1);

        final Message message = new Message();
        message.setSubject("");
        message.setContent("");
        message.setRecipients(Collections.emptyList());
        message.setAttachments(Collections.emptyList());

        final ArgumentCaptor<MimeMessage> mimeMessage = ArgumentCaptor.forClass(MimeMessage.class);

        // When
        smtpService.sendMessage(new MockHttpServletRequest(), credentials, message);

        // Then
        verify(mockedTransport, times(1)).sendMessage(mimeMessage.capture(), Mockito.any());
        assertThat(mimeMessage.getValue().getFrom(), array(hasProperty("address", is("test@email.com"))));
    }


    @Test
    public void sendMessageTestAttachments_messageWithAttachments_shouldCreateAttachments() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("test@attachments.com");
        credentials.setServerHost("mail.attachments.com");
        credentials.setSmtpSsl(true);
        credentials.setSmtpPort(1);

        final Message message = new Message();
        message.setSubject("");
        message.setContent("");
        message.setRecipients(Collections.emptyList());
        final Attachment attachment1 = new Attachment(null, "test.txt", "text/plain", 1337);
        attachment1.setContent("1337".getBytes());
        final Attachment attachment2 = new Attachment(null, "strange.file", null, 1337);
        attachment2.setContent(new byte[0]);
        message.setAttachments(Arrays.asList(attachment1, attachment2));

        final ArgumentCaptor<MimeMessage> mimeMessage = ArgumentCaptor.forClass(MimeMessage.class);

        // When
        smtpService.sendMessage(new MockHttpServletRequest(), credentials, message);

        // Then
        verify(mockedTransport, times(1)).sendMessage(mimeMessage.capture(), Mockito.any());
        final Object content = mimeMessage.getValue().getDataHandler().getContent();
        assertThat(content, instanceOf(MimeMultipart.class));
        assertThat(content, hasProperty("contentType", startsWith("multipart/mixed")));
        assertThat(((MimeMultipart)content).getBodyPart(0),
                headerMatches("Content-type", startsWith("text/plain")));
        assertThat(((MimeMultipart)content).getBodyPart(1),
                headerMatches("Content-type", startsWith("application/octet-stream")));
    }

    protected static final class HeaderMatcher extends FeatureMatcher<MimeBodyPart, String> {

        private final String header;

        private HeaderMatcher(String header, Matcher<? super String> subMatcher) {
            super(subMatcher,"Matcher to extract the header of a MimeBodyPart with",
                    "MimeBodyPart Header");
            this.header = header;
        }

        @Override
        protected String featureValueOf(MimeBodyPart actual) {
            try {
                return actual.getHeader(header, "");
            } catch (MessagingException e) {
                return "";
            }
        }
        static <T> Matcher<T> headerMatches(String header, org.hamcrest.Matcher<? super String> subMatcher) {
            return (Matcher<T>)new HeaderMatcher(header, subMatcher);
        }
    }
}
