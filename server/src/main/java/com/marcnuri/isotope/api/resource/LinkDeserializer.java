/*
 * LinkDeserializer.java
 *
 * Created on 2018-08-18, 8:06
 */
package com.marcnuri.isotope.api.resource;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import org.springframework.hateoas.Link;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.marcnuri.isotope.api.resource.LinkSerializer.HREF;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-18.
 */
public class LinkDeserializer extends StdDeserializer<List<Link>> {

    public LinkDeserializer() {
        this(null);
    }

    public LinkDeserializer(Class<List<Link>> t) {
        super(t);
    }

    @Override
    public List<Link> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        final Map<String, Map<String, String>> linksMap =
                p.getCodec().readValue(p, new TypeReference<Map<String, Map<String, String>>>(){});
        return linksMap.entrySet().stream()
                .map(e -> new Link(e.getValue().get(HREF), e.getKey()))
                .collect(Collectors.toList());
    }

}
