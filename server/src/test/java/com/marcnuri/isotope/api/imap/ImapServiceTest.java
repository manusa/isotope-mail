/*
 * ImapServiceTest.java
 *
 * Created on 2018-12-22, 16:40
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
package com.marcnuri.isotope.api.imap;

import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPStore;
import com.sun.mail.util.MailSSLSocketFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import javax.mail.Flags;
import javax.mail.Message;
import javax.mail.Session;
import javax.mail.URLName;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-12-22.
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({Session.class, IMAPStore.class})
public class ImapServiceTest {

    private Session mockedSession;
    private IMAPStore imapStore;
    private IsotopeApiConfiguration isotopeApiConfiguration;
    private MailSSLSocketFactory mailSSLSocketFactory;
    private CredentialsService credentialsService;

    private ImapService imapService;

    @Before
    public void setUp() throws Exception {
        PowerMockito.mockStatic(Session.class);
        mockedSession = Mockito.mock(Session.class);
        imapStore = Mockito.mock(IMAPStore.class);
        when(Session.getInstance(Mockito.any(), Mockito.any())).thenReturn(mockedSession);
        doReturn(imapStore).when(mockedSession).getStore(Mockito.anyString());

        isotopeApiConfiguration = Mockito.mock(IsotopeApiConfiguration.class);
        mailSSLSocketFactory = Mockito.mock(MailSSLSocketFactory.class);
        credentialsService = Mockito.mock(CredentialsService.class);

        imapService = new ImapService(isotopeApiConfiguration, mailSSLSocketFactory, credentialsService);
    }

    @After
    public void tearDown() {
        isotopeApiConfiguration = null;
        mailSSLSocketFactory = null;
        credentialsService = null;

        imapService = null;
    }

    @Test
    public void setMessagesSeen_validParameters_shouldSetMessagesSeen() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("validUser");
        credentials.setServerHost("email.com");
        credentials.setImapSsl(true);
        credentials.setServerPort(993);

        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(URLName.class));
        doReturn(true).when(folder).exists();
        doReturn(new Message[0]).when(folder).getMessagesByUID(new long[]{1337L});

        // When
        imapService.setMessagesSeen(credentials, new URLName("1337"), true, 1337L);

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(credentials.getServerHost()), Mockito.eq(credentials.getServerPort()),
                Mockito.eq(credentials.getUser()), Mockito.eq(credentials.getPassword()));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.SEEN)), Mockito.eq(true));
        verify(folder, times(1)).close(Mockito.eq(false));
    }

    @Test
    public void setMessagesFlagged_validParameters_shouldSetMessagesFlagged() throws Exception {
        // Given
        final Credentials credentials = new Credentials();
        credentials.setUser("validUser");
        credentials.setServerHost("email.com");
        credentials.setImapSsl(true);
        credentials.setServerPort(993);

        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(URLName.class));
        doReturn(true).when(folder).exists();
        doReturn(new Message[0]).when(folder).getMessagesByUID(new long[]{1337L});

        // When
        imapService.setMessagesFlagged(credentials, new URLName("1337"), true, 1337L);

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(credentials.getServerHost()), Mockito.eq(credentials.getServerPort()),
                Mockito.eq(credentials.getUser()), Mockito.eq(credentials.getPassword()));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.FLAGGED)), Mockito.eq(true));
        verify(folder, times(1)).close(Mockito.eq(false));
    }
}
