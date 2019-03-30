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

import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageWithFolder;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.util.JsonPathExpectationsHelper;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import reactor.core.publisher.Flux;

import javax.mail.URLName;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.marcnuri.isotope.api.configuration.WebConfiguration.IMAP_SERVICE_PROTOTYPE;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    @MockBean(name=IMAP_SERVICE_PROTOTYPE)
    private ImapService imapService;

    private MockMvc mockMvc;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(folderResource).build();
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
        doReturn(Collections.singletonList(mockFolder)).when(imapService).getFolders(Mockito.isNull());

        // When
        final ResultActions result = mockMvc.perform(
                get("/v1/folders")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$").isArray());
        result.andExpect(jsonPath("[0].folderId").value(folderId));
        result.andExpect(jsonPath("[0]._links").exists());
        result.andExpect(jsonPath("[0]._links", aMapWithSize(11)));
        result.andExpect(jsonPath("[0]._links.self.href", endsWith("/v1/folders/1337")));
        result.andExpect(jsonPath("[0]._links.messages.href", endsWith("/v1/folders/1337/messages")));
        result.andExpect(jsonPath("[0]._links['message'].href",
                endsWith("/v1/folders/1337/messages/{messageId}")));
        result.andExpect(jsonPath("[0]._links['message.flagged'].href",
                endsWith("/v1/folders/1337/messages/{messageId}/flagged")));
        result.andExpect(jsonPath("[0]._links['message.move'].href",
                endsWith("/v1/folders/1337/messages/{messageId}/folder/{toFolderId}")));
        result.andExpect(jsonPath("[0]._links['message.move.bulk'].href",
                endsWith("/v1/folders/1337/messages/folder/{toFolderId}")));
        result.andExpect(jsonPath("[0]._links['message.seen'].href",
                endsWith("/v1/folders/1337/messages/{messageId}/seen")));
        result.andExpect(jsonPath("[0]._links['message.seen.bulk'].href",
                endsWith("/v1/folders/1337/messages/seen/{seen}")));
    }

    @Test
    public void createRootFolder_validNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "new-folder";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(Collections.singletonList(mockFolder))
                .when(imapService).createRootFolder(Mockito.eq("new-folder"));

        // When
        final ResultActions result = mockMvc.perform(
                post("/v1/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("new-folder")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$").isArray());
        result.andExpect(jsonPath("$[0].folderId", is("new-folder")));
    }

    @Test
    public void createChildFolder_validFolderParentAndNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "new-folder";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(mockFolder).when(imapService)
                .createChildFolder(Mockito.eq(new URLName("/parent/folder")), Mockito.eq("new-folder"));

        // When
        final ResultActions result = mockMvc.perform(
                post("/v1/folders/L3BhcmVudC9mb2xkZXI=")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("new-folder")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId", is("new-folder")));
    }

    @Test
    public void deleteFolder_validFolderAndNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(mockFolder).when(imapService).deleteFolder(Mockito.eq(new URLName("/original/folder")));

        // When
        final ResultActions result = mockMvc.perform(
                delete("/v1/folders/L29yaWdpbmFsL2ZvbGRlcg==")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }

    @Test
    public void renameFolder_validFolderAndNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder mockFolder = new Folder();
        mockFolder.setName("31337");
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(mockFolder).when(imapService).renameFolder(Mockito.eq(new URLName("/original/folder")), Mockito.eq("31337"));

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/L29yaWdpbmFsL2ZvbGRlcg==/name")
                        .accept(MediaTypes.HAL_JSON_VALUE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("31337")
        );

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$.name").value("31337"));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }
    @Test
    public void moveFolder_validFolderAndNewName_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder mockFolder = new Folder();
        mockFolder.setChildren(new Folder[0]);
        mockFolder.setFolderId(folderId);
        doReturn(mockFolder).when(imapService).moveFolder(
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
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }

    @Test
    public void moveFolder_validFolderAndNullBody_shouldReturnOk_movesTargetToRoot() throws Exception {
        // Given
        final String folderId = "/";
        final Folder mockRootFolder = new Folder();
        mockRootFolder.setChildren(new Folder[0]);
        mockRootFolder.setFolderId(folderId);
        doReturn(mockRootFolder).when(imapService)
                .moveFolder(Mockito.eq(new URLName("/original/folder")), Mockito.isNull());

        // When
        final ResultActions result = mockMvc.perform(
                put("/v1/folders/L29yaWdpbmFsL2ZvbGRlcg==/parent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }

    @Test
    public void getMessages_validFolderId_shouldReturnOk() throws Exception {
        // Given
        final Message mockMessage1 = new Message();
        mockMessage1.setSubject("First Message in Stream");
        final Message mockMessage2 = new Message();
        mockMessage2.setSubject("Second Message in Stream");
        final Flux<ServerSentEvent<List<Message>>> mockFlux = Flux.create(c -> {
            c.next(ServerSentEvent.builder(Collections.singletonList(mockMessage1)).id("1").build());
            c.next(ServerSentEvent.builder(Collections.singletonList(mockMessage2)).id("2").build());
            c.complete();
        });
        doReturn(mockFlux).when(imapService).getMessagesFlux(Mockito.eq(new URLName("1337")), Mockito.any());

        // When
        final ResultActions result = mockMvc.perform(get("/v1/folders/MTMzNw==/messages")
                .accept("text/event-stream"));

        // Then
        result.andDo(MvcResult::getAsyncResult);
        result.andExpect(status().isOk());
        final Pattern p = Pattern.compile("data:(.*)\\n");
        final Matcher m = p.matcher(result.andReturn().getResponse().getContentAsString());
        int results = 0;
        while(m.find()) {
            results++;
            final String content = m.group(1);
            new JsonPathExpectationsHelper("$").assertValueIsArray(content);
            new JsonPathExpectationsHelper("$[0].subject")
                    .assertValue(content, endsWith("Message in Stream"));
        }
        assertThat("Event Stream should contain 2 packets", results, equalTo(2));
    }

    @Test
    public void preloadMessages_validFolderAndValidIds_shouldReturnOk() throws Exception {
        // Given
        final Long messageUid = 1337L;
        final Message message = new Message();
        message.setUid(messageUid);
        message.setSubject("Message in a bottle");
        doReturn(Collections.singletonList(message)).when(imapService).preloadMessages(Mockito.any(), Mockito.anyList());

        // When
        final ResultActions result = mockMvc.perform(
                get("/v1/folders/1337/messages?id=1337")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$").isArray());
        result.andExpect(jsonPath("[0].uid").value(messageUid));
        result.andExpect(jsonPath("[0].subject").value("Message in a bottle"));
    }

    @Test
    public void deleteAllFolderMessages_validFolderAndValidIds_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder folder = new Folder();
        folder.setChildren(new Folder[0]);
        folder.setFolderId(folderId);
        doReturn(folder).when(imapService).deleteAllFolderMessages(Mockito.eq(new URLName("1337")));

        // When
        final ResultActions result = mockMvc.perform(
                delete("/v1/folders/MTMzNw==/messages")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }

    @Test
    public void deleteMessages_validFolderAndValidIds_shouldReturnOk() throws Exception {
        // Given
        final String folderId = "1337";
        final Folder folder = new Folder();
        folder.setChildren(new Folder[0]);
        folder.setFolderId(folderId);
        doReturn(folder).when(imapService).deleteMessages(Mockito.any(), Mockito.anyList());

        // When
        final ResultActions result = mockMvc.perform(
                delete("/v1/folders/1337/messages?id=1337")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.folderId").value(folderId));
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(11)));
    }

    @Test
    public void getMessage_validFolderAndMessageIds_shouldReturnOk() throws Exception {
        // Given
        final MessageWithFolder message = new MessageWithFolder();
        message.setUid(1337L);
        message.setSubject("Message in a bottle");
        message.setFolder(new Folder());
        message.getFolder().setChildren(new Folder[0]);
        message.getFolder().setFolderId("1337");
        doReturn(message).when(imapService).getMessage(Mockito.eq(new URLName("1337")), Mockito.eq(1337L));

        // When
        final ResultActions result = mockMvc.perform(
                get("/v1/folders/MTMzNw==/messages/1337")
                        .accept(MediaTypes.HAL_JSON_VALUE));

        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.uid").value(1337L));
        result.andExpect(jsonPath("$.subject").value("Message in a bottle"));
        result.andExpect(jsonPath("$.folder.folderId").value("1337"));
    }

    @Test
    public void setMessageSeen_validFolderAndMessage_shouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(imapService).setMessagesSeen( Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

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
        doNothing().when(imapService).setMessagesSeen(Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

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
        doNothing().when(imapService).setMessagesFlagged(Mockito.any(), Mockito.anyBoolean(), Mockito.any(long[].class));

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
