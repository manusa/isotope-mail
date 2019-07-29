Isotope Mail Client (Server)
============================

HTTP REST API for IMAP/SMTP communications. 

Java Back-end application designed as a "microservice", future developments
will break down this application into separate microservices for communications with
different protocols (IMAP, SMTP, etc.) and data domains.

## Configuration variables

Variable | Description
-------- | -----------
ENCRYPTION_PASSWORD | Password used for encryption and decryption (symmetric) of credentials (Password must be the same for all the instances of the microservice in a single deployment)
TRUSTED_HOSTS | Comma separated list of hosts allowed as IMAP/SMTP server parameters, if empty or not provided, all hosts will be allowed.
EMBEDDED_IMAGE_SIZE_THRESHOLD | Size in bytes defining the threshold value used to decide if images will be downloaded separately or embedded within messages when retrieved from the client
GOOGLE_ANALYTICS_TRACKING_ID | \[Optional\] Google Analytics tracking id to enable google analytics in client application
