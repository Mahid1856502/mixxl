# Namecheap VPS for Backend 

#!/bin/bash
# 🚀 Deployment script for mixxl

$ ssh root@159.198.74.49 -p 22
root@159.198.74.49's password: Mixxl1234$

echo "=== Navigating to project folder ==="
cd ~/mixxl || exit

echo "=== Stashing local changes (if any) ==="
git stash

echo "=== Pulling latest code from GitHub ==="
git pull

echo "=== Updating environment variables (edit manually if needed) ==="
# nano .env   # uncomment if you need to update env each time

echo "=== Building project ==="
npm run build

echo "=== Restarting PM2 process ==="
pm2 delete mixxl-api || true
pm2 start dist/index.js --name mixxl-api

echo "=== Saving PM2 process list for startup ==="
pm2 save

echo "=== Ensuring Apache is disabled and Nginx is running ==="
sudo systemctl stop httpd || true
sudo systemctl disable httpd || true
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager

echo "✅ Deployment completed successfully!"


# Namecheap shared hosting for Frontend

npm run build
go to dist/public
make a zip
upload on cpanels public_html dit
and extract

Password:

FTP:

FTP Username: mahid@mixxl.fm
FTP server: ftp.mixxl.fm
FTP & explicit FTPS port: 21
Pass: Hucl1yim}tIa

Cpanel:
Username: mixxcata
pass: 19Klark22!@
url: https://server801.web-hosting.com/cpanel