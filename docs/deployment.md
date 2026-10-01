# Deploying Atin HealthCare on a Hostinger VPS

The site is a Next.js **server** application, not a static export: the admin panel,
enquiry form, catalogue search and image uploads all need a running Node process plus
MySQL. This guide targets a Hostinger KVM VPS running Ubuntu, with nginx in front of
Node, MySQL on the same box, and uploaded images on local disk.

> **Not shared hosting.** Hostinger's Premium/Business/Cloud plans are LiteSpeed + PHP
> with no root SSH and no persistent Node process — this app cannot run there.
>
> **Not Vercel either.** Admin uploads write to the filesystem
> (`lib/uploads/paths.ts`); Vercel's is ephemeral, so uploaded product images would
> disappear between requests.

---

## 1. Prepare the VPS in hPanel

In **hPanel → VPS → your server**:

1. **Operating system:** choose a **plain Ubuntu 24.04** template.
   Do *not* pick CyberPanel, CloudPanel, Plesk or any "with panel" image — those run
   their own web server on ports 80/443 and will fight with nginx. If your VPS already
   has one, reinstall with plain Ubuntu before continuing.
2. Note the **IP address** and set/copy the **root SSH password**.
3. **Firewall:** Hostinger's firewall sits *in front of* the server's own `ufw`. Under
   **VPS → Firewall**, allow inbound **22 (SSH)**, **80 (HTTP)** and **443 (HTTPS)**.
   If either firewall blocks a port the site is unreachable with nothing in the nginx
   logs — the most common Hostinger deployment trap.

## 2. Point the domain at the server (do this first — DNS takes time)

In **hPanel → Domains → DNS Zone Editor** for `atinhealth.com`:

| Type | Name | Points to |
|---|---|---|
| A | `@` | your VPS IP |
| A | `www` | your VPS IP |

Delete any conflicting parking records. Verify from your PC with
`nslookup atinhealth.com` — certbot in step 9 fails until this resolves.

## 3. First login and a non-root user

Never run the app as root.

```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
adduser atin
usermod -aG sudo atin
```

Reconnect as that user — everything below runs as `atin`:

```bash
ssh atin@YOUR_VPS_IP
```

## 4. Install the packages

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx git
sudo npm install -g pm2
node -v
```

`node -v` must report 20.9 or newer; Next 16 refuses anything older.

Turn on the server-side firewall as well as Hostinger's:

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

**Swap** — worth adding on the 4 GB KVM 1 plan, where building 208 pages across parallel
workers can hit the OOM killer:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 5. Create the database

```bash
sudo mysql_secure_installation
sudo mysql
```

```sql
CREATE DATABASE atin_healthcare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'atin_app'@'localhost' IDENTIFIED BY 'a-long-random-password';
GRANT ALL PRIVILEGES ON atin_healthcare.* TO 'atin_app'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'atin_app'@'localhost';
```

That last line must list `atin_healthcare`, not just `USAGE` — a grant that silently
never ran is what broke the local setup earlier.

Use a **new** password here, not the local development one, which is in the repo's git
history. If it contains `@ / # : ?`, percent-encode it in the connection URL (`@`
becomes `%40`).

MySQL listens on `127.0.0.1` by default. Leave it there and never open 3306 in the
Hostinger firewall.

## 6. Lay out the directories and clone

Uploaded images live **outside** the repository, so `git pull` and rebuilds can never
touch them:

```bash
sudo mkdir -p /var/www/atin/shared/uploads/{products,site,blog} /var/log/atin
sudo chown -R atin:atin /var/www/atin /var/log/atin
git clone https://github.com/nitishkumarpandittt/adin.git /var/www/atin/app
cd /var/www/atin/app
npm ci
```

## 7. Create the environment file

Create `/var/www/atin/app/.env.local` (gitignored — never commit it):

```ini
DATABASE_URL=mysql://atin_app:URL_ENCODED_PASSWORD@localhost:3306/atin_healthcare

# 32+ random chars: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://atinhealth.com
BETTER_AUTH_TRUSTED_ORIGINS=https://www.atinhealth.com
SITE_URL=https://atinhealth.com

# Must stay below client_max_body_size in deploy/nginx.conf
UPLOAD_DIR=/var/www/atin/shared/uploads
MAX_UPLOAD_MB=5

SHOW_MRP_PUBLIC=false
SHOW_PRESCRIBING_SPECIALITIES=false
SHOW_VISUAL_AIDS=false

# Optional: registered office details are built in; the admin Company page overrides them
NEXT_PUBLIC_COMPANY_PHONE=
NEXT_PUBLIC_COMPANY_WHATSAPP=
NEXT_PUBLIC_COMPANY_EMAIL=
NEXT_PUBLIC_COMPANY_ADDRESS=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
ENQUIRY_TO_EMAIL=
ENQUIRY_FROM_EMAIL=

# Optional WhatsApp notification: WHATSAPP_PROVIDER=meta or twilio, blank = off (see .env.example)
WHATSAPP_PROVIDER=
WHATSAPP_NOTIFY_TO=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_TEMPLATE_NAME=enquiry_received
WHATSAPP_TEMPLATE_LANG=en
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_CONTENT_SID=
```

```bash
chmod 600 .env.local
```

Enquiries are always saved to the database, so SMTP can stay blank until a mailbox
exists — only the notification email is skipped. A Hostinger Titan mailbox works here:
`SMTP_HOST=smtp.titan.email`, `SMTP_PORT=587`.

The WhatsApp notification is optional in the same way. `.env.example` lists the variables
for each provider and the exact Cloud API template body to register; once they are filled
in, `npm run whatsapp:test` sends a test message to every number in `WHATSAPP_NOTIFY_TO`.

## 8. Populate the database, build and start

```bash
cd /var/www/atin/app
npm run db:migrate     # creates the 12 tables
npm run db:seed        # imports the 179-product catalogue and starter blog posts
npm run admin:create   # prompts for name, email and a masked password
npm run build          # prerenders the catalogue; the database must be up
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup            # run the command it prints, so the site survives a reboot
curl -I localhost:3100 # expect HTTP/1.1 200
```

## 9. nginx and HTTPS

```bash
cd /var/www/atin/app
sudo cp deploy/nginx.conf /etc/nginx/sites-available/atin
sudo ln -s /etc/nginx/sites-available/atin /etc/nginx/sites-enabled/atin
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Edit the `server_name` line first if your domain differs, then issue the certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d atinhealth.com -d www.atinhealth.com
```

Certbot rewrites the config with the certificate plus an HTTP→HTTPS redirect, and
installs an auto-renewal timer.

## 10. Redeploying after a change

```bash
/var/www/atin/app/deploy/deploy.sh
```

Pull → `npm ci` → migrate → build → `pm2 reload`. Zero downtime: the old process keeps
serving until the new build is ready.

## 10a. Automatic deploys (GitHub Actions)

`.github/workflows/deploy.yml` runs `deploy/deploy.sh` on the server after every push to `master`.
One-time setup — on the server, create a key GitHub will use to log in:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N "" -C "github-actions" && cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys && cat ~/.ssh/github-deploy
```

Then in the GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | the VPS IP |
| `DEPLOY_USER` | `root` (or the app user) |
| `DEPLOY_SSH_KEY` | the private key printed above, including the BEGIN/END lines |

Every push now deploys within ~2 minutes; the **Actions** tab shows each run and its log. A push
can also be re-deployed by hand from that tab ("Run workflow").

## 11. Backups

`crontab -e`:

```cron
30 2 * * * mysqldump -u atin_app -pPASSWORD atin_healthcare | gzip > /var/backups/atin-$(date +\%F).sql.gz
40 2 * * * tar czf /var/backups/atin-uploads-$(date +\%F).tar.gz -C /var/www/atin/shared uploads
```

Hostinger's VPS snapshots cover the whole disk — keep those enabled too, and copy
`/var/backups` off the server periodically.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Site unreachable, nginx logs empty | Port 80/443 blocked in the **hPanel** firewall, which is separate from `ufw` |
| nginx fails to bind port 80 | A panel image (CyberPanel/OpenLiteSpeed/Apache) owns it — reinstall plain Ubuntu |
| Build fails: `DATABASE_URL is not set` | The build prerenders catalogue pages from MySQL; `.env.local` must exist and MySQL be running before `npm run build` |
| Build killed with no error | Out of memory — add the swap file from step 4 |
| Admin upload fails with 413 | `client_max_body_size` in nginx is below `MAX_UPLOAD_MB + 1`; raise both together |
| Admin login bounces back to the login page | `BETTER_AUTH_URL` / `SITE_URL` must be the exact public HTTPS origin, and nginx must forward `X-Forwarded-Proto` |
| Images 404 after a redeploy | `UPLOAD_DIR` points inside the repo instead of `/var/www/atin/shared/uploads` |
| certbot reports a DNS problem | The A records from step 2 have not propagated yet |
