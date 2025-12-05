#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh

# Remove any existing certificate for this domain first
sudo certbot delete --cert-name ellarises-intex-1-14.is404.net --non-interactive || true

# Request new certificate with correct domain
sudo certbot certonly --nginx \
  -d ellarises-intex-1-14.is404.net \
  --non-interactive \
  --agree-tos \
  --email koapono@byu.edu \
  --force-renewal

# Configure nginx to use the certificate
sudo tee /etc/nginx/conf.d/https.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name ellarises-intex-1-14.is404.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ellarises-intex-1-14.is404.net;

    ssl_certificate /etc/letsencrypt/live/ellarises-intex-1-14.is404.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ellarises-intex-1-14.is404.net/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

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

# Reload nginx
sudo systemctl reload nginx
