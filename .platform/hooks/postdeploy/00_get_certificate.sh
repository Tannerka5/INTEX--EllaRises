#!/usr/bin/env bash
sudo certbot -n --nginx \
  -d ellarises-1-14-intex.is404.net \
  --agree-tos \
  --redirect \
  --email garrettmnelson01@gmail.com
