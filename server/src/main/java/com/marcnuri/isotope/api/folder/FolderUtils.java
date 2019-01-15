/*
 * FolderUtils.java
 *
 * Created on 2018-11-20, 20:17
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
import org.springframework.lang.NonNull;

import javax.mail.MessagingException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static com.marcnuri.isotope.api.folder.Folder.ATTR_TRASH;
import static com.marcnuri.isotope.api.folder.Folder.TRASH_FOLDER_NAME;
import static javax.mail.Folder.HOLDS_MESSAGES;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-11-20.
 */
public class FolderUtils {

    private FolderUtils() {}

    /**
     * Adds default (required) system folders to user's mailbox if not present.
     *
     * @param rootFolder Top level folder in the mailbox
     * @param existingFolders List of already existing folders
     * @return list of folders to chain
     * @throws MessagingException IMAP server related problems
     */
    public static List<Folder> addSystemFolders(@NonNull IMAPFolder rootFolder, @NonNull List<Folder> existingFolders)
            throws MessagingException {

        // Add Trash folder if none matches, or arbitrarily set Trash attribute
        if (existingFolders.stream().noneMatch(f -> f.getAttributes().contains(ATTR_TRASH))) {
            final Optional<Folder> existingTrash = existingFolders.stream()
                    .filter(f -> f.getName().equalsIgnoreCase(TRASH_FOLDER_NAME))
                    .findAny();
            if (existingTrash.isPresent()) {
                existingTrash.get().getAttributes().add(ATTR_TRASH);
            } else {
                final IMAPFolder newTrash = (IMAPFolder)rootFolder.getFolder(TRASH_FOLDER_NAME);
                if (newTrash.create(HOLDS_MESSAGES)) {
                    final Folder newTrashFolder = Folder.from(newTrash, false);
                    newTrashFolder.getAttributes().add(ATTR_TRASH);
                    existingFolders.add(newTrashFolder);
                }
            }
        }
        return existingFolders;
    }

    /**
     * Renames the specified {@link IMAPFolder} to the provided newFolderFullName.
     *
     * <p>Method return the newly named folder parent and all its children. Renamed folder will have
     * a reference to its previous id in order to help the API consumers identify which folder was renamed.
     *
     * @param folderToRename the folder to rename
     * @param newFolderFullName the new folder name (can contain separator characters)
     * @return renamed folder parent
     * @throws MessagingException IMAP server related problems
     */
    public static Folder renameFolder(IMAPFolder folderToRename, String newFolderFullName) throws MessagingException {
        final String previousFolderId = Folder.toBase64Id(folderToRename.getURLName());
        final IMAPFolder renamedFolder = (IMAPFolder)folderToRename.getStore().getFolder(newFolderFullName);
        if (!folderToRename.renameTo(renamedFolder)) {
            throw new InvalidFieldException("New folder name was not accepted by IMAP server");
        }
        final IMAPFolder imapParent;
        if (renamedFolder.getParent().getFullName().equals("")) {
            // If parent is Root, getParent doesn't return the default folder, override to return default folder instead.
            imapParent = (IMAPFolder)renamedFolder.getStore().getDefaultFolder();
        } else {
            imapParent = (IMAPFolder)renamedFolder.getParent();
        }
        final Folder parent = Folder.from(imapParent, true);
        // Identify renamed folder
        Stream.of(parent.getChildren())
                .filter(f -> f.getFullName().equals(newFolderFullName))
                .findAny()
                .ifPresent(f -> f.setPreviousFolderId(previousFolderId));
        return parent;
    }
}
