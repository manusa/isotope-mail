/*
 * Attachment.java
 *
 * Created on 2018-09-11, 7:07
 */
package com.marcnuri.isotope.api.message;

import com.marcnuri.isotope.api.resource.IsotopeResource;

import java.io.Serializable;
import java.util.Objects;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-09-11.
 */
public class Attachment extends IsotopeResource implements Serializable {

    private static final long serialVersionUID = 4001902363078332347L;

    private String contentId;
    private String fileName;
    private String contentType;
    private Integer size;

    public Attachment(String contentId, String fileName, String contentType, Integer size) {
        this.contentId = contentId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
    }

    public String getContentId() {
        return contentId;
    }

    public void setContentId(String contentId) {
        this.contentId = contentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Attachment that = (Attachment) o;
        return Objects.equals(contentId, that.contentId) &&
                Objects.equals(fileName, that.fileName) &&
                Objects.equals(contentType, that.contentType) &&
                Objects.equals(size, that.size);
    }

    @Override
    public int hashCode() {

        return Objects.hash(contentId, fileName, contentType, size);
    }
}
