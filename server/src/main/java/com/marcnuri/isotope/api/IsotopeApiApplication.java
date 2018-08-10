package com.marcnuri.isotope.api;

import com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(IsotopeApiConfiguration.class)
public class IsotopeApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(IsotopeApiApplication.class, args);
	}
}
