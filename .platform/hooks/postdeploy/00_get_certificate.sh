#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh

sudo certbot -n -d ellarises-intex-1-14.is404.net --nginx --agree-tos --email koapono@byu.edu
