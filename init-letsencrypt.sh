#!/bin/sh
# One-time bootstrap for Let's Encrypt certificates.
#
# Run this on the production host, once, the first time the certbot-etc
# volume is empty. nginx's 443 server block requires a certificate to exist
# before it will start, so this script:
#   1. Generates a short-lived self-signed cert so nginx can boot.
#   2. Starts nginx (serving the ACME HTTP-01 challenge on port 80).
#   3. Requests the real certificate from Let's Encrypt via the webroot plugin.
#   4. Reloads nginx to pick up the real certificate.
#
# Requires DNS for $DOMAIN to already point at this host, and port 80
# reachable from the internet. After this, the certbot service's own renewal
# loop (see docker-compose.yml) keeps the certificate up to date.
set -e

DOMAIN="kontact-web.ru"
EMAIL="bbogomolov61@gmail.com" # change if you want a different Let's Encrypt account
VOLUME="kontact-web-next_certbot-etc"

echo "### Generating a temporary self-signed certificate for $DOMAIN ..."
docker run --rm -v "$VOLUME:/etc/letsencrypt" alpine sh -c "
  apk add --no-cache openssl >/dev/null &&
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=$DOMAIN'
"

echo "### Starting nginx ..."
docker compose up -d nginx

echo "### Requesting the real certificate from Let's Encrypt ..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL --agree-tos --no-eff-email \
    --force-renewal" certbot

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

echo "### Done. The certbot service will keep the certificate renewed automatically."
