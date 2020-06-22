#!/bin/sh

mkdir /certificates
openssl req -newkey rsa:2048 -days 365 -nodes -x509 -keyout /certificates/server.key -out /certificates/server.cert -subj "/C=FR/ST=Paris/O=IPSSI/OU=IT/CN=localhost"
nginx -g "daemon off;"
