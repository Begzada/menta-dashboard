# Menta Dashboard Deployment Guide

This guide explains how to deploy the Menta Dashboard to a VPS using GitHub Actions and Nginx.

## Prerequisites

- Ubuntu/Debian VPS server
- Node.js 20+ installed on VPS
- Nginx installed on VPS
- PM2 installed on VPS (recommended)
- Domain name (optional but recommended)

## VPS Setup

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Configure PM2

```bash
# Create PM2 ecosystem file
pm2 init

# Or manually start the app (will be done by GitHub Actions)
cd /var/www/menta-dashboard
pm2 start npm --name "menta-dashboard" -- start
pm2 save
pm2 startup  # Follow the instructions to enable PM2 on boot
```

### 3. Configure Nginx

```bash
# Copy the nginx.conf to Nginx sites-available
sudo cp /path/to/nginx.conf /etc/nginx/sites-available/menta-dashboard

# Edit the configuration
sudo nano /etc/nginx/sites-available/menta-dashboard
# Update 'server_name' with your actual domain

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/menta-dashboard /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Configure Firewall

```bash
# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5. (Optional) Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically update your Nginx configuration
```

## GitHub Repository Setup

### Required Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VPS_HOST` | VPS IP address or domain | `192.168.1.100` or `example.com` |
| `VPS_USERNAME` | SSH username | `ubuntu` or `root` |
| `VPS_SSH_KEY` | Private SSH key | Contents of `~/.ssh/id_rsa` |
| `VPS_PORT` | SSH port (optional) | `22` (default) |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |

### Generate SSH Key (if needed)

On your local machine or VPS:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy public key to VPS authorized_keys
ssh-copy-id -i ~/.ssh/id_rsa.pub user@vps-ip

# Copy private key content for GitHub secret
cat ~/.ssh/id_rsa
# Copy the entire output including -----BEGIN/END-----
```

## Deployment Process

### Automatic Deployment

Pushes to the `main` branch will automatically trigger deployment:

```bash
git add .
git commit -m "Deploy changes"
git push origin main
```

### Manual Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. Select **Deploy to VPS** workflow
4. Click **Run workflow**
5. Select branch and click **Run workflow**

## Application Structure on VPS

```
/var/www/menta-dashboard/
├── .next/                 # Built Next.js application
├── public/               # Static files
├── package.json          # Dependencies
├── package-lock.json     # Lock file
├── next.config.ts        # Next.js config
└── .env.production       # Production environment variables
```

## Routes

After deployment, the application will be accessible at:

- **Login**: `https://your-domain.com/management/login`
- **Dashboard**: `https://your-domain.com/management/dashboard`
- **Accounts**: `https://your-domain.com/management/dashboard/accounts`
- **Therapists**: `https://your-domain.com/management/dashboard/therapists`
- **Patients**: `https://your-domain.com/management/dashboard/patients`
- **Certificates**: `https://your-domain.com/management/dashboard/certificates`
- **Events**: `https://your-domain.com/management/dashboard/events`
- **Questionnaires**: `https://your-domain.com/management/dashboard/questionnaires`

## Troubleshooting

### Check PM2 Status

```bash
pm2 status
pm2 logs menta-dashboard
pm2 restart menta-dashboard
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
sudo tail -f /var/log/nginx/error.log
```

### Check Application Logs

```bash
pm2 logs menta-dashboard --lines 100
```

### Manual Deployment (if GitHub Actions fails)

```bash
# SSH into VPS
ssh user@vps-ip

# Navigate to app directory
cd /var/www/menta-dashboard

# Pull latest changes (if using git on VPS)
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart PM2
pm2 restart menta-dashboard
```

## Environment Variables

Create `/var/www/menta-dashboard/.env.production` with:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NODE_ENV=production
```

## Monitoring

### Setup PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Checks

```bash
# Check if app is running
curl https://your-domain.com/management/login

# Check PM2 process
pm2 monit
```

## Security Recommendations

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use environment variables** for sensitive data

3. **Enable firewall**:
   ```bash
   sudo ufw status
   ```

4. **Regular backups** of application data

5. **Monitor logs** for suspicious activity

6. **Use HTTPS** with SSL certificates

## Rollback

If deployment fails, rollback to previous version:

```bash
pm2 restart menta-dashboard --update-env
# Or restore from backup
```

## Support

For issues or questions, please contact the development team.
