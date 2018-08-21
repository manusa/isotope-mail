FROM nginx:1.15.2-alpine

MAINTAINER Marc Nuri <marc@marcnuri.com>
LABEL MAINTAINER "Marc Nuri" <marc@marcnuri.com>

EXPOSE 80

COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./client/dist /usr/share/nginx/html

CMD nginx -g 'daemon off;'

