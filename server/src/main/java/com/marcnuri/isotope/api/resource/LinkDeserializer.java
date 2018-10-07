/*
 * LinkDeserializer.java
 *
 * Created on 2018-08-18, 8:06
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
