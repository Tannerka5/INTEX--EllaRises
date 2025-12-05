#!/usr/bin/env bash

# Only get certificate if it doesn't exist
if [ ! -d "/etc/letsencrypt/live/ellarises-intex-1-14.is404.net" ]; then
    echo "Getting new certificate..."
    sudo certbot certonly --nginx \
      -d ellarises-intex-1-14.is404.net \
      --non-interactive \
      --agree-tos \
      --email koapono@byu.edu
fi

echo "Certificate check complete"
