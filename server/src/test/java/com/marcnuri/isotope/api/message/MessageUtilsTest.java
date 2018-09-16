/*
 * MessageUtilsTest.java
 *
 * Created on 2018-09-16, 17:59
 */
package com.marcnuri.isotope.api.message;

import org.junit.Test;
import org.mockito.Mockito;

import javax.mail.Folder;
import javax.mail.Message;

import static com.marcnuri.isotope.api.message.MessageUtils.envelopeFetch;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

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
}
