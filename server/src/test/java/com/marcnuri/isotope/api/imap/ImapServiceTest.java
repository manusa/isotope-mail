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
import com.marcnuri.isotope.api.configuration.WithMockCredentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.exception.NotFoundException;
import com.marcnuri.isotope.api.folder.Folder;
import com.marcnuri.isotope.api.folder.FolderUtils;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPStore;
import com.sun.mail.util.MailSSLSocketFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.internal.verification.VerificationModeFactory;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.modules.junit4.PowerMockRunnerDelegate;
import org.springframework.test.context.junit4.SpringRunner;

import javax.mail.Flags;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.URLName;
import java.util.Collections;
import java.util.List;

import static com.marcnuri.isotope.api.configuration.WithMockCredentials.PASSWORD;
import static com.marcnuri.isotope.api.configuration.WithMockCredentials.SERVER_HOST;
import static com.marcnuri.isotope.api.configuration.WithMockCredentials.SERVER_PORT;
import static com.marcnuri.isotope.api.configuration.WithMockCredentials.USER;
import static org.hamcrest.Matchers.arrayWithSize;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-12-22.
 */
@RunWith(PowerMockRunner.class)
@PowerMockRunnerDelegate(SpringRunner.class)
@PrepareForTest({Session.class, IMAPStore.class, FolderUtils.class})
public class ImapServiceTest {

    private IMAPStore imapStore;
    private IsotopeApiConfiguration isotopeApiConfiguration;
    private MailSSLSocketFactory mailSSLSocketFactory;
    private CredentialsService credentialsService;

    private ImapService imapService;

    @Before
    public void setUp() throws Exception {
        PowerMockito.mockStatic(Session.class);
        final Session mockedSession = Mockito.mock(Session.class);
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
    @WithMockCredentials
    public void createRootFolder_validParameters_shouldCreateFolder() throws Exception {
        // Given
        final IMAPFolder rootFolder = Mockito.mock(IMAPFolder.class);
        doReturn(rootFolder).when(imapStore).getDefaultFolder();
        doReturn(new URLName("/")).when(rootFolder).getURLName();
        doReturn(new String[0]).when(rootFolder).getAttributes();

        final IMAPFolder newFolder = Mockito.mock(IMAPFolder.class);
        doReturn(newFolder).when(rootFolder).getFolder(Mockito.eq("new-folder"));
        doReturn(new IMAPFolder[]{newFolder}).when(rootFolder).list();
        doReturn(false).when(newFolder).exists();
        doReturn(new URLName("/new-folder")).when(newFolder).getURLName();
        doReturn(new String[0]).when(newFolder).getAttributes();
        doReturn(new IMAPFolder[0]).when(newFolder).list();

        // When
        final List<Folder> result = imapService.createRootFolder("new-folder");

        // Then
        verify(newFolder, times(1))
                .create(Mockito.eq(IMAPFolder.HOLDS_MESSAGES | IMAPFolder.HOLDS_FOLDERS));
        assertThat(result, hasSize(1));
    }

    @Test
    @WithMockCredentials
    public void createChildFolder_validParameters_shouldCreateFolder() throws Exception {
        // Given
        final IMAPFolder parentFolder = Mockito.mock(IMAPFolder.class);
        doReturn(parentFolder).when(imapStore).getFolder(Mockito.eq("/parent"));
        doReturn(true).when(parentFolder).exists();
        doReturn(new URLName("/parent")).when(parentFolder).getURLName();
        doReturn(new String[0]).when(parentFolder).getAttributes();

        final IMAPFolder newFolder = Mockito.mock(IMAPFolder.class);
        doReturn(newFolder).when(parentFolder).getFolder(Mockito.eq("new-folder"));
        doReturn(new IMAPFolder[]{newFolder}).when(parentFolder).list();
        doReturn(false).when(newFolder).exists();
        doReturn(new URLName("/new-folder")).when(newFolder).getURLName();
        doReturn(new String[0]).when(newFolder).getAttributes();
        doReturn(new IMAPFolder[0]).when(newFolder).list();

        // When
        final Folder result = imapService.createChildFolder(new URLName("/parent"), "new-folder");

        // Then
        verify(newFolder, times(1))
                .create(Mockito.eq(IMAPFolder.HOLDS_MESSAGES | IMAPFolder.HOLDS_FOLDERS));
        assertThat(result.getChildren(), arrayWithSize(1));
    }

    @Test
    @WithMockCredentials(serverHost = "1337.isotope.com")
    public void moveFolder_validParameters_shouldRenameFolder() throws Exception {
        // Given
        PowerMockito.mockStatic(FolderUtils.class);
        PowerMockito.doCallRealMethod()
                .when(FolderUtils.class, "getFileWithRef", Mockito.any(URLName.class));

        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.eq("/1337"));
        doReturn(true).when(folder).exists();
        doReturn("/1337").when(folder).getFullName();
        doReturn("1337").when(folder).getName();

        final IMAPFolder targetFolder = Mockito.mock(IMAPFolder.class);
        doReturn(targetFolder).when(imapStore).getFolder(Mockito.eq("/target/folder"));
        doReturn(true).when(targetFolder).exists();
        doReturn("/target/folder").when(targetFolder).getFullName();
        doReturn('/').when(targetFolder).getSeparator();

        // When
        imapService.moveFolder(new URLName("/1337"), new URLName("/target/folder"));

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq("1337.isotope.com"), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        PowerMockito.verifyStatic(FolderUtils.class, VerificationModeFactory.times(1));
        FolderUtils.renameFolder(Mockito.eq(folder), Mockito.eq("/target/folder/1337"));
    }

    @Test
    @WithMockCredentials
    public void moveFolder_validParametersNullTarget_shouldRenameFolder() throws Exception {
        // Given
        PowerMockito.mockStatic(FolderUtils.class);
        PowerMockito.doCallRealMethod()
                .when(FolderUtils.class, "getFileWithRef", Mockito.any(URLName.class));

        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.eq("/1337"));
        doReturn(true).when(folder).exists();
        doReturn("/1337").when(folder).getFullName();
        doReturn("1337").when(folder).getName();

        final IMAPFolder targetFolder = Mockito.mock(IMAPFolder.class);
        doReturn(targetFolder).when(imapStore).getDefaultFolder();
        doReturn(true).when(targetFolder).exists();
        doReturn("").when(targetFolder).getFullName();
        doReturn('/').when(targetFolder).getSeparator();

        // When
        imapService.moveFolder(new URLName("/1337"), null);

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        PowerMockito.verifyStatic(FolderUtils.class, VerificationModeFactory.times(1));
        FolderUtils.renameFolder(Mockito.eq(folder), Mockito.eq("1337"));
    }

    @Test(expected = NotFoundException.class)
    @WithMockCredentials
    public void moveFolder_folderNotFound_shouldThrowException() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(String.class));
        doReturn(false).when(folder).exists();

        // When
        imapService.moveFolder(new URLName("/1337"), new URLName("/target/folder"));

        // Then
        fail();
    }

    @Test(expected = IsotopeException.class)
    @WithMockCredentials
    public void moveFolder_validParametersMessagingException_shouldThrowException() throws Exception {
        // Given
        PowerMockito.mockStatic(FolderUtils.class);
        PowerMockito.doCallRealMethod()
                .when(FolderUtils.class, "getFileWithRef", Mockito.any(URLName.class));
        PowerMockito.when(FolderUtils.renameFolder(Mockito.any(), Mockito.any())).thenThrow(new MessagingException());

        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.eq("/1337"));
        doReturn(true).when(folder).exists();
        doReturn("/1337").when(folder).getFullName();
        doReturn("1337").when(folder).getName();

        final IMAPFolder targetFolder = Mockito.mock(IMAPFolder.class);
        doReturn(targetFolder).when(imapStore).getFolder(Mockito.eq("/target/folder"));
        doReturn(true).when(targetFolder).exists();
        doReturn("/target/folder").when(targetFolder).getFullName();
        doReturn('/').when(targetFolder).getSeparator();

        // When
        imapService.moveFolder(new URLName("/1337"), new URLName("/target/folder"));

        // Then
        fail();
    }

    @Test
    @WithMockCredentials
    public void deleteFolder_validParameters_shouldDeleteFolder() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.eq("/1337"));
        doReturn(true).when(folder).exists();
        doReturn("/1337").when(folder).getFullName();
        doReturn("1337").when(folder).getName();
        final IMAPFolder parent = Mockito.mock(IMAPFolder.class);
        doReturn(parent).when(folder).getParent();
        doReturn(new URLName("imap://account/1337")).when(parent).getURLName();
        doReturn(new String[0]).when(parent).getAttributes();
        doReturn(new javax.mail.Folder[0]).when(parent).list();

        // When
        imapService.deleteFolder(new URLName("/1337"));

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        verify(folder, times(1)).delete(Mockito.eq(true));
    }

    @Test
    @WithMockCredentials
    public void setMessagesSeen_validParameters_shouldSetMessagesSeen() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(String.class));
        doReturn(true).when(folder).exists();
        doReturn(new Message[0]).when(folder).getMessagesByUID(new long[]{1337L});

        // When
        imapService.setMessagesSeen(new URLName("1337"), true, 1337L);

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.SEEN)), Mockito.eq(true));
        verify(folder, times(1)).close(Mockito.eq(false));
    }

    @Test
    @WithMockCredentials
    public void setMessagesFlagged_validParameters_shouldSetMessagesFlagged() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(String.class));
        doReturn(true).when(folder).exists();
        doReturn(new Message[0]).when(folder).getMessagesByUID(new long[]{1337L});

        // When
        imapService.setMessagesFlagged(new URLName("1337"), true, 1337L);

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.FLAGGED)), Mockito.eq(true));
        verify(folder, times(1)).close(Mockito.eq(false));
    }

    @Test
    @WithMockCredentials
    public void deleteAllFolderMessages_validParameters_shouldFlagAndExpungeMessages() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(String.class));
        doReturn(new URLName("/")).when(folder).getURLName();
        doReturn(new String[0]).when(folder).getAttributes();
        doReturn(new IMAPFolder[0]).when(folder).list();
        doReturn(true).when(folder).exists();
        doReturn(new Message[]{null}).when(folder).getMessages();
        // When
        imapService.deleteAllFolderMessages(new URLName("1337"));
        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.DELETED)), Mockito.eq(true));
        verify(folder, times(1)).expunge();
    }

    @Test
    @WithMockCredentials
    public void deleteMessages_validParameters_shouldFlagAndExpungeMessages() throws Exception {
        // Given
        final IMAPFolder folder = Mockito.mock(IMAPFolder.class);
        doReturn(folder).when(imapStore).getFolder(Mockito.any(String.class));
        doReturn(new URLName("/")).when(folder).getURLName();
        doReturn(new String[0]).when(folder).getAttributes();
        doReturn(new IMAPFolder[0]).when(folder).list();
        doReturn(true).when(folder).exists();
        doReturn(new Message[]{null}).when(folder).getMessagesByUID(new long[]{1337L});

        // When
        imapService.deleteMessages(new URLName("1337"), Collections.singletonList(1337L));

        // Then
        verify(imapStore, times(1)).connect(
                Mockito.eq(SERVER_HOST), Mockito.eq(SERVER_PORT),
                Mockito.eq(USER), Mockito.eq(PASSWORD));
        verify(folder, times(1)).setFlags(
                Mockito.any(Message[].class), Mockito.eq(new Flags(Flags.Flag.DELETED)), Mockito.eq(true));
        verify(folder, times(1)).expunge(Mockito.any());
    }
}
