# <img src="doc/isotope-logo-h-800.png" alt="Isotope Mail Client" />
 [![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/manusa/isotope-mail/blob/master/LICENSE) 
 [![Build Status](https://travis-ci.org/manusa/isotope-mail.svg?branch=master)](https://travis-ci.org/manusa/isotope-mail) 
 [![Code coverage](https://sonarcloud.io/api/project_badges/measure?project=manusa_isotope-mail&metric=coverage)](https://sonarcloud.io/component_measures?id=manusa_isotope-mail&metric=coverage) 
 [![Total alerts](https://img.shields.io/lgtm/alerts/g/manusa/isotope-mail.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/manusa/isotope-mail/alerts/) 
 [![e2e tests](https://img.shields.io/travis/manusa/isotope-mail-e2e-tests.svg?label=e2e+tests)](https://manusa.github.com/isotope-mail-e2e-tests) 
 [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=elhXKzgwaTdHQVBVSktYWkpXUFZ0bittOWxnallCZmQyUlRJSERsSWhPVT0tLUorUGlwOVdrYnJQOUlEeFZnOFcxQ0E9PQ==--ea07b9af5d47a508232c96d1805fad609073b527)](https://www.browserstack.com/automate/public-build/elhXKzgwaTdHQVBVSktYWkpXUFZ0bittOWxnallCZmQyUlRJSERsSWhPVT0tLUorUGlwOVdrYnJQOUlEeFZnOFcxQ0E9PQ==--ea07b9af5d47a508232c96d1805fad609073b527)

Microservice based webmail client built with ReactJS and Spring.

## Introduction

This webmail client is still in a very early stage, use at your own risk.

## TL;DR

If you just want to check out the current status of the project you can deploy the application
using the example traefik docker-compose.

Just run the following commands:

```
git clone https://github.com/manusa/isotope-mail.git
cd isotope-mail/docker/traefik
docker-compose pull && docker-compose up --force-recreate
```

Point your browser to [localhost](http://localhost) and login using the credentials of your mailserver.

<p>
  <img src="doc/tldr-isotope-deploy.gif" />
</p>

## Demo

You can see the latest snapshot version in action at: [isotope.marcnuri.com](https://isotope.marcnuri.com/login?serverHost=isotope&user=isotope&smtpPort=25&smtpSsl=false)

<p>
  <img src="doc/isotope-demo-login.gif" />
</p>

Use the following credentials:
 - Host: isotope
 - User: isotope
 - Password: demo

You can send e-mails to the demo account (isotope@isotope) by setting the SMTP server advanced settings:
 - Port: 25
 - SMTP SSL: false

## Focus on Code Quality
 [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=manusa_isotope-mail&metric=ncloc)](https://sonarcloud.io/dashboard?id=manusa_isotope-mail) 
 [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/manusa/isotope-mail.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/manusa/isotope-mail/context:javascript) 
 [![Language grade: Java](https://img.shields.io/lgtm/grade/java/g/manusa/isotope-mail.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/manusa/isotope-mail/context:java) 
 [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=manusa_isotope-mail&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=manusa_isotope-mail) 
 [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=manusa_isotope-mail&metric=security_rating)](https://sonarcloud.io/dashboard?id=manusa_isotope-mail) 
 [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=manusa_isotope-mail&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=manusa_isotope-mail) 
 
One of the main reasons to develop Isotope Mail is to learn and showcase new technologies, frameworks and libraries
and how they can be used in a real life product. There is a stronger focus on achieving top quality code rather
than delivering a large number of features.

In order to guarantee top code quality the project is using
[Sonar Cloud](https://sonarcloud.io/dashboard?id=manusa_isotope-mail) and
[LGTM - Looks Good To Me](https://lgtm.com/projects/g/manusa/isotope-mail/) to perform static code analysis.

## License

Isotope is [Apache 2.0 Licensed](./LICENSE).

## Acknowledgements

Isotope Mail team wants to recognize the following third parties for providing software,
support or services free of charge.

<img width=200 src="https://p14.zdusercontent.com/attachment/1015988/jnfTAsRFuKVzfvJMDJ8Ui45p8?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..H0_YyxaE762GtXQvUnHoYw.R3tCI87tR-lehrK_zjT7GmEI--69EORCPWqTPY_iVa2Pt7468NrQBRAvoO5k1-H0W5YJGw45Fnz6ArGGOX796PWiCdTujuUv0_OTnRKnXU1Zjw3ytoLLFdZH1NTOxAvJUqt8RA3-Dj3mKJ-IGy7l-oqxN5zDXppNQA5xumK9uYu6VNp2JzjMg1ZnPzcOxub5jy7dqMmsxSN9mzpRgjjsNBUKI8a9I4jVzDm13tPLBjKl2bRdxVS14IapUYBpW8NRDrhw8f4mfYYtKR8CSFlCNiFkKtZd-CpZYGLgH7Y23CU.RqsF1R4_vpfkA7VhBRgsZQ" />

Thanks to [BrowserStack](https://www.browserstack.com) for providing a free open source account
to use their products for testing in real devices and browsers.
