TL;DR
- Run these commands on your DigitalOcean droplet (not in Windows PowerShell).
- SSH into the server, install Certbot, configure nginx, obtain a Let's Encrypt certificate, then clear Laravel caches.

1) SSH to your droplet

Use your droplet's public IP or domain. Example:

```bash
ssh root@YOUR_DROPLET_IP
```

If you use a non-root user, replace `root` with your username and prefix privileged commands with `sudo`.

2) Install nginx (if not installed) and Certbot

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

3) Example `nginx` server block for Laravel

Create `/etc/nginx/sites-available/api.example.com` and set `server_name` and `root` to your app's `public` folder. Example:

```nginx
server {
    listen 80;
    server_name api.example.com YOUR_DROPLET_IP;

    root /var/www/laravel/public;
    index index.php index.html;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock; # adjust PHP socket/version
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Enable and test nginx configuration:

```bash
sudo ln -s /etc/nginx/sites-available/api.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4) Obtain a Let's Encrypt certificate

Run Certbot to obtain and install the certificate (will edit nginx config for you):

```bash
sudo certbot --nginx -d api.example.com
```

Follow prompts to complete issuance. Certbot will configure HTTPS and redirect HTTP to HTTPS if you choose.

5) Clear Laravel caches and ensure `APP_URL` and CORS env

From your Laravel app root on the server:

```bash
cd /path/to/your/laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

Update `.env` to set `APP_URL=https://api.example.com` and optionally set `CORS_ALLOWED_ORIGINS=https://agri-report-generator-1.vercel.app`

6) Update Vercel env and redeploy

In your Vercel project settings set the Production env var `VITE_API_URL` to:

```
https://api.example.com/api
```

Then redeploy the frontend.

7) Verify from your workstation

```bash
curl -I https://api.example.com/api/reports
```

Check browser DevTools Network tab while loading your Vercel site to confirm requests succeed and CORS header `Access-Control-Allow-Origin` is present.

If you prefer not to run Certbot, you can use Cloudflare (Free) in front of your droplet and enable SSL there (use Full (strict) for best security).

If you want, I can produce a ready-to-use `nginx` file with exact paths for your server user and PHP version — tell me the droplet's web root path and PHP-FPM socket/version.
