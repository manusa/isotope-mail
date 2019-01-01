/*
 * FolderResourceTest.java
 *
 * Created on 2018-09-23, 19:35
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

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.credentials.CredentialsService;
import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.message.Message;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.mail.URLName;
import java.util.Collections;

import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.endsWith;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-23.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = FolderResource.class)
public class FolderResourceTest {

    @Autowired
    private FolderResource folderResource;

    @MockBean
    private CredentialsService credentialsService;
    @MockBean
    private ImapService imapService;

    private MockMvc mockMvc;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(folderResource).build();
        doReturn(new Credentials()).when(credentialsService).fromRequest(Mockito.any());
    }

    @After
    public void tearDown() {
        mockMvc = null;
    }

    @Test
    public void getFolders_na_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(Collections.singletonList(mockFolder))
                .when(imapService).getFolders(Mockito.any(), Mockito.isNull());

        // When
        final ResultActions result = mockMvc.perform(
                get("/v1/folders")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$").isArray());
        result.andExpect(jsonPath("[0].folderId").value(folderId));
        result.andExpect(jsonPath("[0]._links").exists());
        result.andExpect(jsonPath("[0]._links", aMapWithSize(3)));
        result.andExpect(jsonPath("[0]._links.messages.href", endsWith("/v1/folders/1337/messages")));
    }

    @Test
    public void moveFolder_validFolderAndNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(mockFolder).when(imapService).moveFolder(Mockito.any(),
                Mockito.eq(new URLName("/original/folder")), Mockito.eq(new URLName("/target/folder/id")));

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/L29yaWdpbmFsL2ZvbGRlcg==/parent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("L3RhcmdldC9mb2xkZXIvaWQ=")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(3)));
    }

    @Test
    public void preloadMessages_validFolderAndValidIds_shouldReturnOk() throws Exception {
        // Given
        final Long messageUid = 1337L;
        final Message message = new Message();
        message.setUid(messageUid);
        message.setSubject("Message in a bottle");
        doReturn(Collections.singletonList(message))
                .when(imapService).preloadMessages(Mockito.any(), Mockito.any(), Mockito.anyList());

        // When
        final ResultActions result = mockMvc.perform(
                get("/v1/folders/1337/messages?id=1337")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$").isArray());
        result.andExpect(jsonPath("[0].uid").value(messageUid));
        result.andExpect(jsonPath("[0].subject").value("Message in a bottle"));
        result.andExpect(jsonPath("[0]._links").exists());
        result.andExpect(jsonPath("[0]._links", aMapWithSize(6)));
    }

    @Test
    public void deleteMessages_validFolderAndValidIds_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder folder = new Folder();
        folder.setChildren(new Folder[0]);
        folder.setFolderId(folderId);
        doReturn(folder)
                .when(imapService).deleteMessages(Mockito.any(), Mockito.any(), Mockito.anyList());

        // When
        final ResultActions result = mockMvc.perform(
                delete("/v1/folders/1337/messages?id=1337")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(3)));
    }

    @Test
    public void setMessageSeen_validFolderAndMessage_shouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(imapService)
                .setMessagesSeen(Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/1337/messages/1337/seen")
                        .content("\"true\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isNoContent());
    }

    @Test
    public void setMessagesSeen_validFolderAndMessages_shouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(imapService)
                .setMessagesSeen(Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/1337/messages/seen/true")
                        .content("[1337]")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isNoContent());
    }

    @Test
    public void setMessageFlagged_validFolderAndMessage_shouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(imapService)
                .setMessagesFlagged(Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/1337/messages/1337/flagged")
                        .content("\"true\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isNoContent());
    }
}
