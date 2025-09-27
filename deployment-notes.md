# Namecheap VPS for Backend 

#!/bin/bash
# 🚀 Deployment script for mixxl

$ ssh root@159.198.74.49 -p 22
root@159.198.74.49's password: Mixxl1234$

git stash
git pull
# nano .env   # uncomment if you need to update env each time
pm2 delete mixxl-api || true
npm run build
pm2 start dist/index.js --name mixxl-api
pm2 startup systemd
pm2 save

sudo systemctl stop httpd || true
sudo systemctl disable httpd || true
    sudo systemctl restart nginx
sudo systemctl status nginx --no-pager

# to verify deployment
pm2 logs

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