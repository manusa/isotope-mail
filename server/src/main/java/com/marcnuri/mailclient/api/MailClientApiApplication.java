package com.marcnuri.mailclient.api;

import com.marcnuri.mailclient.api.configuration.MailClientApiConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(MailClientApiConfiguration.class)
public class MailClientApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MailClientApiApplication.class, args);
	}
}
