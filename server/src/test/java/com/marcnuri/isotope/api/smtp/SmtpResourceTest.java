/*
 * SmtpResourceTest.java
 *
 * Created on 2019-02-26, 7:00
 */
package com.marcnuri.isotope.api.smtp;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-02-26.
 */
public class SmtpResourceTest {

    private SmtpService smtpService;

    private MockMvc mockMvc;

    @Before
    public void setUp() {
        smtpService = Mockito.mock(SmtpService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new SmtpResource(() -> smtpService)).build();
    }

    @After
    public void tearDown() {
        smtpService = null;
        mockMvc = null;
    }

    @Test
    public void sendMessage_validMessage_shouldReturnNoContent() throws Exception {
        // Given

        // When
        final ResultActions result = mockMvc.perform(post("/v1/smtp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"recipients\":[{\"type\":\"To\",\"address\":\"to@mail.com\"}]}")
        );

        // Then
        result.andExpect(status().isNoContent());
        verify(smtpService, times(1)).sendMessage(Mockito.any(), Mockito.any());
    }

    @Test
    public void sendMessage_invalidMessage_shouldReturnBadRequest() throws Exception {
        // Given

        // When
        final ResultActions result = mockMvc.perform(post("/v1/smtp")
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .content("{}")
        );

        // Then
        result.andExpect(status().isBadRequest());
    }

}
