#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh

DOMAIN="ellarises-intex-1-14.is404.net"
EMAIL="koapono@byu.edu"

# Check if certificate already exists
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Certificate doesn't exist, obtaining new certificate..."
    
    # Stop nginx temporarily
    sudo systemctl stop nginx
    
    # Get certificate using standalone mode
    sudo certbot certonly --standalone \
      -d $DOMAIN \
      --non-interactive \
      --agree-tos \
      --email $EMAIL \
      --preferred-challenges http
    
    # Start nginx back up
    sudo systemctl start nginx
else
    echo "Certificate already exists"
fi

# Always ensure nginx SSL configuration exists
sudo tee /etc/nginx/conf.d/https.conf > /dev/null <<'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ellarises-intex-1-14.is404.net;
    
    # Allow certbot renewals
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ellarises-intex-1-14.is404.net;

    # SSL certificate paths
    ssl_certificate /etc/letsencrypt/live/ellarises-intex-1-14.is404.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ellarises-intex-1-14.is404.net/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Proxy to your Node.js app
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Reload nginx to apply configuration
sudo nginx -t && sudo systemctl reload nginx

echo "SSL configuration complete"
