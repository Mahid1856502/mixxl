# Namecheap VPS for Backend

## Docker (recommended)

On the VPS (after SSH works):

```bash
# One-time: install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in

cd /opt/mixxl   # or your clone path
git pull
cp .env.example .env   # first time only — then edit with real secrets
nano .env
chmod +x scripts/deploy-docker.sh
./scripts/deploy-docker.sh
```

Nginx should proxy to `http://127.0.0.1:5000` (see `deploy/nginx-api.conf.example`).

Useful commands:

```bash
docker compose logs -f api
docker compose restart api
docker compose down
```

## Legacy PM2 deploy

```bash
ssh root@YOUR_VPS_IP -p 22

git stash
git pull
# nano .env
pm2 delete mixxl-api || true
npm run build
pm2 start dist/index.js --name mixxl-api
pm2 startup systemd
pm2 save

sudo systemctl stop httpd || true
sudo systemctl disable httpd || true
sudo systemctl restart nginx
pm2 logs
```


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


https://privateemail.com/
mahid@mixxl.fm
2VaQ:xRL7Ee5Yp*


for local host
npx vite -- client
npm run dev -- server
