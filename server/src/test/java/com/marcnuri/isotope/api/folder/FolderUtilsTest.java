/*
 * FolderUtilsTest.java
 *
 * Created on 2018-11-21, 6:53
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
package com.marcnuri.isotope.api.folder;

import com.marcnuri.isotope.api.exception.InvalidFieldException;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPStore;
import org.junit.Test;
import org.mockito.Mockito;

import javax.mail.URLName;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.folder.FolderUtils.addSystemFolders;
import static com.marcnuri.isotope.api.folder.FolderUtils.getFileWithRef;
import static com.marcnuri.isotope.api.folder.FolderUtils.renameFolder;
import static javax.mail.Folder.HOLDS_MESSAGES;
import static org.hamcrest.Matchers.arrayWithSize;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.collection.IsIterableContainingInOrder.contains;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-11-21.
 */
public class FolderUtilsTest {

    @Test
    public void addSystemFolders_listWithTrashAttribute_shouldDoNothing() throws Exception {
        // Given
        final Folder trashFolder = Mockito.mock(Folder.class);
        doReturn(Stream.of("\\Trash").collect(Collectors.toSet())).when(trashFolder).getAttributes();
        final List<Folder> originalFolders = Collections.singletonList(trashFolder);
        final IMAPFolder rootFolder = Mockito.mock(IMAPFolder.class);

        // When
        final List<Folder> result = addSystemFolders(rootFolder, originalFolders);

        // Then
        verify(rootFolder, times(0)).getFolder(Mockito.eq("Trash"));
        int expectedSize = 1;
        assertThat(result, is(originalFolders));
        assertThat(result, hasSize(expectedSize));
    }

    @Test
    public void addSystemFolders_listWithTrashFolderName_shouldAddAttributeToExistingTrash() throws Exception {
        // Given
        final Folder trashFolder = Mockito.mock(Folder.class);
        doReturn(new HashSet<>()).when(trashFolder).getAttributes();
        doReturn("Trash").when(trashFolder).getName();
        final List<Folder> originalFolders = Collections.singletonList(trashFolder);
        final IMAPFolder rootFolder = Mockito.mock(IMAPFolder.class);

        // When
        final List<Folder> result = addSystemFolders(rootFolder, originalFolders);

        // Then
        verify(rootFolder, times(0)).getFolder(Mockito.eq("Trash"));
        assertThat(trashFolder.getAttributes(), contains("\\Trash"));
        int expectedSize = 1;
        assertThat(result, is(originalFolders));
        assertThat(result, hasSize(expectedSize));
    }

    @Test
    public void addSystemFolders_emptyList_shouldAddTrashFolder() throws Exception {
        // Given
        final List<Folder> originalFolders = new ArrayList<>();
        final IMAPFolder rootFolder = Mockito.mock(IMAPFolder.class);
        final IMAPFolder newFolder = Mockito.mock(IMAPFolder.class);
        doReturn(newFolder).when(rootFolder).getFolder(Mockito.eq("Trash"));
        doReturn(true).when(newFolder).create(Mockito.eq(HOLDS_MESSAGES));
        doReturn(new URLName("1337")).when(newFolder).getURLName();
        doReturn(new String[0]).when(newFolder).getAttributes();

        // When
        final List<Folder> result = addSystemFolders(rootFolder, originalFolders);

        // Then
        verify(rootFolder, times(1)).getFolder(Mockito.eq("Trash"));
        verify(newFolder, times(1)).create(Mockito.eq(HOLDS_MESSAGES));
        int expectedSize = 1;
        assertThat(result, is(originalFolders));
        assertThat(result, hasSize(expectedSize));
    }

    @Test
    public void renameFolder_validFolderAndName_shouldReturnParentWithRenamedChild() throws Exception {
        // Given
        final IMAPFolder folderToRename = Mockito.mock(IMAPFolder.class);
        doReturn(new URLName("oldFolderId")).when(folderToRename).getURLName();
        final String newFolderFullName = "/folder/newName";

        final IMAPStore mockedStore = Mockito.mock(IMAPStore.class);
        doReturn(mockedStore).when(folderToRename).getStore();
        final IMAPFolder mockedFolder = Mockito.mock(IMAPFolder.class);
        doReturn(mockedFolder).when(mockedStore).getFolder(Mockito.eq(newFolderFullName));
        doReturn(true).when(folderToRename).renameTo(Mockito.eq(mockedFolder));
        doReturn(new IMAPFolder[0]).when(mockedFolder).list();
        doReturn(new URLName(newFolderFullName)).when(mockedFolder).getURLName();
        doReturn(newFolderFullName).when(mockedFolder).getFullName();
        doReturn(new String[0]).when(mockedFolder).getAttributes();
        final IMAPFolder mockedFolderParent = Mockito.mock(IMAPFolder.class);
        doReturn(mockedFolderParent).when(mockedFolder).getParent();
        doReturn(new IMAPFolder[]{mockedFolder}).when(mockedFolderParent).list();
        doReturn("/folder").when(mockedFolderParent).getFullName();
        doReturn(new URLName("/folder")).when(mockedFolderParent).getURLName();
        doReturn(new String[0]).when(mockedFolderParent).getAttributes();

        // When
        final Folder result = renameFolder(folderToRename, newFolderFullName);

        // Then
        assertThat(result.getFullURL(), is("/folder"));
        assertThat(result.getPreviousFolderId(), nullValue());
        assertThat(result.getChildren(), arrayWithSize(1));
        assertThat(result.getChildren()[0].getFullURL(), is("/folder/newName"));
        assertThat(result.getChildren()[0].getFolderId(), is("L2ZvbGRlci9uZXdOYW1l"));
        assertThat(result.getChildren()[0].getPreviousFolderId(), is("b2xkRm9sZGVySWQ="));
    }

    @Test(expected = InvalidFieldException.class)
    public void renameFolder_validFolderAndInvalidName_shouldThrowException() throws Exception {
        // Given
        final IMAPFolder folderToRename = Mockito.mock(IMAPFolder.class);
        doReturn(new URLName("oldFolderId")).when(folderToRename).getURLName();
        final String newFolderFullName = "/folder/newName";

        final IMAPStore mockedStore = Mockito.mock(IMAPStore.class);
        doReturn(mockedStore).when(folderToRename).getStore();
        final IMAPFolder mockedFolder = Mockito.mock(IMAPFolder.class);
        doReturn(mockedFolder).when(mockedStore).getFolder(Mockito.eq(newFolderFullName));
        doReturn(false).when(folderToRename).renameTo(Mockito.eq(mockedFolder));

        // When
        final Folder result = renameFolder(folderToRename, newFolderFullName);

        // Then
        fail();
    }

    @Test
    public void getFileWithRef_URLNameWithHash_shouldReturnProperFolderName() {
        // Given
        final URLName urlName = new URLName("imaps://server.host:993/Inbox/Folder#With#Hash");

        // When
        final String result = getFileWithRef(urlName);

        // Then
        assertThat(urlName.getFile(), equalTo("Inbox/Folder"));
        assertThat(result, equalTo("Inbox/Folder#With#Hash"));
    }

    @Test
    public void getFileWithRef_URLNameWithEndHash_shouldReturnProperFolderName() {
        // Given
        final URLName urlName = new URLName("imaps://server.host:993/Inbox/Folder#");

        // When
        final String result = getFileWithRef(urlName);

        // Then
        assertThat(urlName.getFile(), equalTo("Inbox/Folder"));
        assertThat(result, equalTo("Inbox/Folder#"));
    }

    @Test
    public void getFileWithRef_URLNameWithNoHash_shouldReturnProperFolderName() {
        // Given
        final URLName urlName = new URLName("imaps://server.host:993/Inbox/FolderWithNoHash");

        // When
        final String result = getFileWithRef(urlName);

        // Then
        assertThat(result, equalTo(urlName.getFile()));
        assertThat(result, equalTo("Inbox/FolderWithNoHash"));
    }
}
