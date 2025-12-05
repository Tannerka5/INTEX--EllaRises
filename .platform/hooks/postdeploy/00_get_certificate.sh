#!/usr/bin/env bash

DOMAIN="ellarises-intex-1-14.is404.net"
EMAIL="koapono@byu.edu"

# Check if certificate exists
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Certificate does not exist. Obtaining new certificate..."
    
    # Get certificate
    sudo certbot certonly --webroot -w /var/www/html \
      -d $DOMAIN \
      --non-interactive \
      --agree-tos \
      --email $EMAIL
    
    echo "Certificate obtained successfully"
else
    echo "Certificate already exists"
fi

# Ensure nginx has correct permissions
sudo chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
sudo chmod 644 /etc/letsencrypt/live/$DOMAIN/privkey.pem

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

echo "HTTPS configuration complete"
