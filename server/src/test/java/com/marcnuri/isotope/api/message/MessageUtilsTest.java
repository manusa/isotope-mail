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
