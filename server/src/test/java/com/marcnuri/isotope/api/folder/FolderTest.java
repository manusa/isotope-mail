/*
 * FolderTest.java
 *
 * Created on 2019-01-26, 8:18
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

import org.junit.Test;

import javax.mail.URLName;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2019-01-26.
 */
public class FolderTest {

    @Test
    public void toBase64Id_asciiString_shouldEncodeOk() {
        // Given
        final URLName folderName = new URLName("This is a regular String!:");

        // When
        final String result = Folder.toBase64Id(folderName);

        // Then
        assertThat(result, equalTo("VGhpcyBpcyBhIHJlZ3VsYXIgU3RyaW5nITo="));
    }

    @Test
    public void toBase64Id_chineseCharactersString_shouldEncodeOk() {
        // Given
        final URLName folderName = new URLName("阿双方的");

        // When
        final String result = Folder.toBase64Id(folderName);

        // Then
        assertThat(result, equalTo("6Zi_5Y-M5pa555qE"));
    }

    @Test
    public void toBase64Id_mixedChineseCharactersString_shouldEncodeOk() {
        // Given
        final URLName folderName = new URLName("原种 - 1337");

        // When
        final String result = Folder.toBase64Id(folderName);

        // Then
        assertThat(result, equalTo("5Y6f56eNIC0gMTMzNw=="));
    }

    @Test
    public void toBase64Id_fullMixedUrlString_shouldEncodeOk() {
        // Given
        final URLName folderName = new URLName("imaps://isotope@marcnuri.com:993/原种 - 1337");

        // When
        final String result = Folder.toBase64Id(folderName);

        // Then
        assertThat(result, equalTo("aW1hcHM6Ly9pc290b3BlQG1hcmNudXJpLmNvbTo5OTMv5Y6f56eNIC0gMTMzNw=="));
    }

    @Test
    public void toBase64Id_fullMixedUrlString2_shouldEncodeOk() {
        // Given
        final URLName folderName = new URLName("imaps://isotope@isotope:993/原种 - 1337");

        // When
        final String result = Folder.toBase64Id(folderName);

        // Then
        assertThat(result, equalTo("aW1hcHM6Ly9pc290b3BlQGlzb3RvcGU6OTkzL-WOn-enjSAtIDEzMzc="));
    }

    @Test
    public void toId_asciiString_shouldDecodeOk() {
        // Given
        final String encodedId = "VGhpcyBpcyBhIHJlZ3VsYXIgU3RyaW5nITo=";

        // When
        final URLName result = Folder.toId(encodedId);

        // Then
        assertThat(result.toString(), equalTo("This is a regular String!:"));
    }

    @Test
    public void toId_chineseCharactersString_shouldDecodeOk() {
        // Given
        final String encodedId = "6Zi_5Y-M5pa555qE";

        // When
        final URLName result = Folder.toId(encodedId);

        // Then
        assertThat(result.toString(), equalTo("阿双方的"));
    }

    @Test
    public void toId_mixedChineseCharactersString_shouldDecodeOk() {
        // Given
        final String encodedId = "5Y6f56eNIC0gMTMzNw==";

        // When
        final URLName result = Folder.toId(encodedId);

        // Then
        assertThat(result.toString(), equalTo("原种 - 1337"));
    }

    @Test
    public void toId_fullMixedUrlString_shouldDecodeOk() {
        // Given
        final String encodedId = "aW1hcHM6Ly9pc290b3BlQG1hcmNudXJpLmNvbTo5OTMv5Y6f56eNIC0gMTMzNw==";

        // When
        final URLName result = Folder.toId(encodedId);

        // Then
        assertThat(result.toString(), equalTo("imaps://isotope@marcnuri.com:993/原种 - 1337"));
    }

    @Test
    public void toId_fullMixedUrlString2_shouldDecodeOk() {
        // Given
        final String encodedId = "aW1hcHM6Ly9pc290b3BlQGlzb3RvcGU6OTkzL-WOn-enjSAtIDEzMzc=";

        // When
        final URLName result = Folder.toId(encodedId);

        // Then
        assertThat(result.toString(), equalTo("imaps://isotope@isotope:993/原种 - 1337"));
    }
}
