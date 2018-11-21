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

import com.sun.mail.imap.IMAPFolder;
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
import static javax.mail.Folder.HOLDS_MESSAGES;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsIterableContainingInOrder.contains;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;

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
}
