/*
 * MessageUtilsTest.java
 *
 * Created on 2018-09-16, 17:59
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
package com.marcnuri.isotope.api.message;

import com.marcnuri.isotope.api.exception.InvalidFieldException;
import org.junit.Test;
import org.mockito.Mockito;

import javax.mail.Address;
import javax.mail.Folder;
import javax.mail.Message;
import java.util.Arrays;
import java.util.List;

import static com.marcnuri.isotope.api.message.MessageUtils.envelopeFetch;
import static org.hamcrest.Matchers.arrayWithSize;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.*;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-16.
 */
public class MessageUtilsTest {

    @Test
    public void envelopeFetch_validFolderAndMessageArray_shouldFetchMessages() throws Exception {
        // Given
        final Folder mockFolder = Mockito.mock(Folder.class);
        final Message[] mockMessages = new Message[]{Mockito.mock(Message.class)};

        // When
        envelopeFetch(mockFolder, mockMessages);

        // Then
        verify(mockFolder, times(1)).fetch(Mockito.any(), Mockito.any());
    }

    @Test
    public void envelopeFetch_validFolderAndEmptyMessageArray_shouldNotFetchMessages() throws Exception {
        // Given
        final Folder mockFolder = Mockito.mock(Folder.class);
        final Message[] mockMessages = new Message[0];

        // When
        envelopeFetch(mockFolder, mockMessages);

        // Then
        verify(mockFolder, never()).fetch(Mockito.any(), Mockito.any());
    }

    @Test
    public void getRecipientAddresses_validMessageNoRecipients_shouldReturnAddresses() {
        // Given
        final com.marcnuri.isotope.api.message.Message message =
                Mockito.mock(com.marcnuri.isotope.api.message.Message.class);
        doReturn(null).when(message).getRecipients();

        // When
        final Address[] result = MessageUtils.getRecipientAddresses(message, Message.RecipientType.TO);

        // Then
        int expectedSize = 0;
        assertThat(result, arrayWithSize(expectedSize));
    }

    @Test
    public void getRecipientAddresses_validMessage_shouldReturnAddresses() {
        // Given
        final com.marcnuri.isotope.api.message.Message message =
                Mockito.mock(com.marcnuri.isotope.api.message.Message.class);
        final List<Recipient> recipients = Arrays.asList(
                new Recipient("To", "valid@toemail.com"),
                new Recipient("Cc", "valid@ccemail.com")
        );
        doReturn(recipients).when(message).getRecipients();

        // When
        final Address[] result = MessageUtils.getRecipientAddresses(message, Message.RecipientType.TO);

        // Then
        int expectedSize = 1;
        assertThat(result, arrayWithSize(expectedSize));
    }

    @Test(expected = InvalidFieldException.class)
    public void getRecipientAddresses_invalidMessage_shouldThrowException() {
        // Given
        final com.marcnuri.isotope.api.message.Message message =
                Mockito.mock(com.marcnuri.isotope.api.message.Message.class);
        final List<Recipient> recipients = Arrays.asList(
                new Recipient("To", "invalid@email@address_"),
                new Recipient("Cc", "valid@ccemail.com")
        );
        doReturn(recipients).when(message).getRecipients();

        // When
        final Address[] result = MessageUtils.getRecipientAddresses(message, Message.RecipientType.TO);

        // Then
        fail();
    }
}
