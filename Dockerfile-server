FROM openjdk:8-jre-alpine

MAINTAINER Marc Nuri <marc@marcnuri.com>
LABEL MAINTAINER "Marc Nuri" <marc@marcnuri.com>

EXPOSE 9010

COPY ./server/build/libs /opt

CMD java -jar /opt/api-0.0.1-SNAPSHOT.jar
