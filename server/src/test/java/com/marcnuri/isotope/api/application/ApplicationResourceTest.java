/*
 * ApplicationResourceTest.java
 *
 * Created on 2019-04-07, 8:46
 *
 * Copyright 2019 Marc Nuri
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
package com.marcnuri.isotope.api.application;

import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import com.marcnuri.isotope.api.imap.ImapService;
import com.marcnuri.isotope.api.smtp.SmtpService;
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

import static com.marcnuri.isotope.api.configuration.WebConfiguration.IMAP_SERVICE_PROTOTYPE;
import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-04-07.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = ApplicationResource.class)
public class ApplicationResourceTest {

    @Autowired
    private ApplicationResource applicationResource;
    @MockBean
    private IsotopeApiConfiguration isotopeApiConfiguration;
    @MockBean(name = IMAP_SERVICE_PROTOTYPE)
    private ImapService imapService;
    @MockBean
    private SmtpService smtpService;

    private MockMvc mockMvc;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(applicationResource).build();
    }

    @After
    public void tearDown() {
        mockMvc = null;
    }

    @Test
    public void getConfiguration_na_shouldReturnOk() throws Exception {
        // Given
        // Untouched IsotopeApiConfiguration
        // When
        final ResultActions result = mockMvc.perform(get("/v1/application/configuration")
                .accept(MediaTypes.HAL_JSON_VALUE));
        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$._links").exists());
        result.andExpect(jsonPath("$._links", aMapWithSize(14)));
        result.andExpect(jsonPath("$._links['application.login'].href", endsWith("/v1/application/login")));
        result.andExpect(jsonPath("$._links['folders'].href", endsWith("/v1/folders")));
        result.andExpect(jsonPath("$._links.['folders.self'].href",
                endsWith("/v1/folders/{folderId}")));
        result.andExpect(jsonPath("$._links['folders.messages'].href",
                endsWith("/v1/folders/{folderId}/messages")));
        result.andExpect(jsonPath("$._links['folders.message'].href",
                endsWith("/v1/folders/{folderId}/messages/{messageId}")));
        result.andExpect(jsonPath("$._links['folders.message.flagged'].href",
                endsWith("/v1/folders/{folderId}/messages/{messageId}/flagged")));
        result.andExpect(jsonPath("$._links['folders.message.move'].href",
                endsWith("/v1/folders/{folderId}/messages/{messageId}/folder/{toFolderId}")));
        result.andExpect(jsonPath("$._links['folders.message.move.bulk'].href",
                endsWith("/v1/folders/{folderId}/messages/folder/{toFolderId}")));
        result.andExpect(jsonPath("$._links['folders.message.seen'].href",
                endsWith("/v1/folders/{folderId}/messages/{messageId}/seen")));
        result.andExpect(jsonPath("$._links['folders.message.seen.bulk'].href",
                endsWith("/v1/folders/{folderId}/messages/seen/{seen}")));
        result.andExpect(jsonPath("$._links.smtp.href", endsWith("/v1/smtp")));
    }

    @Test
    public void login_validCredentials_shouldReturnOk() throws Exception {
        // Given
        doAnswer(inv -> inv.getArgument(0)).when(imapService).checkCredentials(Mockito.any());
        doNothing().when(smtpService).checkCredentials(Mockito.any());
        // When
        final ResultActions result = mockMvc.perform(post("/v1/application/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"serverHost\":\"host\"," +
                        "\"serverPort\":1337," +
                        "\"user\":\"user\"," +
                        "\"password\":\"password\"," +
                        "\"imapSsl\":true," +
                        "\"smtpPort\":31337," +
                        "\"smtpSsl\":true" +
                        "}")
                .accept(MediaTypes.HAL_JSON_VALUE));
        // Then
        result.andExpect(status().isOk());
        result.andExpect(jsonPath("$.serverHost", is("host")));
        result.andExpect(jsonPath("$.serverPort", is(1337)));
    }

    @Test
    public void login_invalidCredentials_shouldReturnBadRequest() throws Exception {
        // Given
        // When
        final ResultActions result = mockMvc.perform(post("/v1/application/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .accept(MediaTypes.HAL_JSON_VALUE));
        // Then
        result.andExpect(status().isBadRequest());
    }
}
