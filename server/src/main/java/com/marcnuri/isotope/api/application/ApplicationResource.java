/*
 * ApplicationResource.java
 *
 * Created on 2018-08-15, 18:09
 */
package com.marcnuri.isotope.api.application;

import com.marcnuri.isotope.api.credentials.Credentials;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-08-15.
 */
@RestController
@RequestMapping(path = "/v1/application")
public class ApplicationResource {

    @RequestMapping(path = "/login", method = POST, produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<Credentials> login(@RequestBody Credentials credentials) {
        return ResponseEntity.ok(credentials);
    }

}
