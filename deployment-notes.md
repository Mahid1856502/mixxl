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

Uses `network_mode: host` so the API binds directly on the VPS (avoids docker-proxy/iptables issues on AlmaLinux).

After deploy, verify:

```bash
curl -s http://127.0.0.1:5000/api/health
curl -s https://server1.mixxl.fm/api/health
```

Useful commands:

```bash
docker compose logs -f api
docker compose restart api
docker compose down
```

### Investigating past crashes (every few days)

We cannot know the exact historical cause without logs from when the server died. Run on the VPS after any incident (or weekly):

```bash
chmod +x scripts/diagnose-vps.sh
./scripts/diagnose-vps.sh
```

**Most likely causes** (from app + typical PM2 VPS setups):

| Cause | What to look for |
|--------|------------------|
| **Out of memory (OOM)** | `RestartCount` rising, `OOMKilled=true`, kernel log `Killed process` |
| **Disk full** | `df -h` at 100%, Docker/nginx can't write logs |
| **Process hang (not exit)** | Container `Up` but health/curl times out; Neon DB or connection pool stuck |
| **Host reboot / VPS maintenance** | `uptime` low, no OOM, container was stopped until manual fix |
| **No auto-restart (old PM2)** | Server fine after reboot but API down until you SSH'd in |

**Code-level risk factors** (not proven without metrics):

- Global JWT middleware runs a **DB query on every authenticated request** (`bootstrap-core.ts`).
- **Neon serverless pool** + WebSockets; connection pressure under traffic spikes.
- **Multer** writes banners to `uploads/` on disk (in Docker, that dir is ephemeral unless you add a volume).
- No `pm2` memory limit was configured in repo (`max_memory_restart`).

**Watch over the next week:**

```bash
docker inspect mixxl-api --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}}'
```

If `RestartCount` stays `0`, Docker auto-restart may be enough. If it climbs, check the diagnose report and consider a memory limit in `docker-compose.yml`.

### Troubleshooting 502 / curl to :5000 hangs

If `docker compose exec api` can reach `/api/health` but `curl http://127.0.0.1:5000/api/health` on the host times out, Docker port forwarding is broken. This compose file uses host networking to fix that. Recreate the container after pulling:

```bash
docker compose down
docker compose up -d --force-recreate
curl -s http://127.0.0.1:5000/api/health
sudo nginx -t && sudo systemctl reload nginx
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
