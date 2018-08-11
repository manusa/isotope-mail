/*
 * LinkSerializer.java
 *
 * Created on 2018-08-11, 9:13
 */
package com.marcnuri.isotope.api.resource;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.springframework.hateoas.Link;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-11.
 */
public class LinkSerializer extends StdSerializer<List<Link>> {

    public LinkSerializer() {
        this(null);
    }

    public LinkSerializer(Class<List<Link>> t) {
        super(t);
    }

    @Override
    public void serialize(List<Link> links, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        for (Link link : links) {
            gen.writeObjectField(link.getRel(), toEntry(link));
        }
        gen.writeEndObject();
    }
    private static final Map toEntry(Link link) {
        final Map fields = new HashMap<String, String>(1);
        fields.put("href", link.getHref());
        return fields;
    }
}
