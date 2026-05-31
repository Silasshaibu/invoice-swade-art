# Deploy Invoice App to Vercel

## ✅ Quick Start (5 minutes)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Click "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Select the `Silasshaibu/invoice-swade-art` repository

### Step 2: Create Vercel Project
1. Click "Import Project"
2. Select `invoice-swade-art` repository
3. Click "Import"
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./` (default)
6. Click "Continue"

### Step 3: Add Environment Variables
Before deploying, add these environment variables in Vercel:

**Required:**
- `DATABASE_URL` = Your Neon PostgreSQL connection string
  - Get from: https://console.neon.tech → Projects → Connection string
  - Format: `postgresql://user:password@host/database`

- `JWT_SECRET` = Generate a secure random string
  - Use: `openssl rand -base64 32` or any random generator
  - Example: `abcd1234efgh5678ijkl9012mnop3456qrst7890uv/w==`

**Optional (for first run only):**
- `SEED_ADMIN_PASSWORD` = Temporary password for admin account
  - Only set this on first deployment
  - Remove after creating admin user
  - Example: `TempPassword123!`

### Step 4: Deploy
1. Click "Deploy"
2. Wait 1-3 minutes for build to complete
3. ✅ Your app is live at: `https://invoice-swade-art.vercel.app`

### Step 5: Connect Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter: `invoice.swade-art.com`
4. Follow DNS configuration instructions

---

## 🔧 DNS Configuration

### Option A: Update Nameservers (Recommended)
1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS/Nameserver settings
3. Replace with Vercel nameservers:
   - `ns1.vercel.com`
   - `ns2.vercel.com`
   - `ns3.vercel.com`
   - `ns4.vercel.com`
4. Wait 24-48 hours for propagation

### Option B: Add CNAME Record
1. Log in to your domain registrar
2. Find DNS Records section
3. Add CNAME record:
   - Name: `invoice`
   - Value: `cname.vercel-dns.com`
4. Wait 24-48 hours for propagation

### Option C: Add A Record (if using Vercel IP)
1. Get Vercel's IP address from deployment
2. Add A record pointing to that IP

---

## ✅ After Deployment

### Test the Application
1. Visit: https://invoice.swade-art.com (after DNS propagates)
2. Or: https://invoice-swade-art.vercel.app (immediately)
3. Login with:
   - Email: `admin@invoice.swade-art.com`
   - Password: (the SEED_ADMIN_PASSWORD you set)

### First Steps
1. ✅ Log in to dashboard
2. ✅ Go to Settings → Update company info
3. ✅ Create a test client
4. ✅ Create a test invoice
5. ✅ Test payments tracking

### Clean Up
1. Remove `SEED_ADMIN_PASSWORD` from Vercel environment variables
2. Change admin password in app (Settings page)
3. Create other user accounts as needed

---

## 📊 Environment Variables Reference

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host/database

# JWT Secret (Required)
JWT_SECRET=generate-random-string-here

# Admin Seeding (Optional - only on first run)
SEED_ADMIN_PASSWORD=temporary-admin-password

# Email Service (Future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
```

---

## 🚀 Advanced: Custom Domain Setup

### Using Vercel CLI (Alternative)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Add domain
vercel domains add invoice.swade-art.com

# List domains
vercel domains ls
```

---

## 🔒 Security Checklist

- [ ] `JWT_SECRET` is a random, secure string (not default)
- [ ] `DATABASE_URL` is correct and accessible
- [ ] `SEED_ADMIN_PASSWORD` removed after first login
- [ ] Environment variables not committed to git
- [ ] DNS records configured correctly
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Firewall rules configured in Neon (if needed)

---

## 🛠️ Troubleshooting

### Build Fails
- Check logs in Vercel dashboard
- Ensure `package.json` and `.next` folder are correct
- Verify Node.js version (16+)

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Ensure IP whitelist allows Vercel IPs
- Test connection locally: `psql $DATABASE_URL`

### Domain Not Working
- Check DNS propagation: https://dnschecker.org
- Verify Vercel domain settings are correct
- Wait up to 48 hours for DNS to propagate

### Admin Login Fails
- Verify `SEED_ADMIN_PASSWORD` was set before deployment
- Check database has users table
- Reset via Neon dashboard if needed

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Code committed to GitHub master branch
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database is running (Neon account active)

During deployment:
- [ ] GitHub connected to Vercel
- [ ] Environment variables added
- [ ] Build completes successfully
- [ ] Preview deployment works

After deployment:
- [ ] Live URL is accessible
- [ ] Admin login works
- [ ] Database queries working
- [ ] Custom domain configured

---

## 💡 Tips

1. **Automatic Deploys**: Every push to master auto-deploys
2. **Preview Deployments**: Pull requests get preview URLs
3. **Rollback**: Use Vercel dashboard to revert to previous deployment
4. **Logs**: View real-time logs in Vercel dashboard → Deployments → Logs
5. **Monitoring**: Set up error tracking in Vercel (Sentry integration)

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech
- Domain Settings: https://vercel.com/dashboard/settings/domains
- Environment Variables: https://vercel.com/dashboard/[project]/settings/environment-variables
- Build Logs: https://vercel.com/dashboard/[project]/deployments

---

## ✅ Final Status

Your Invoice App is ready to deploy to Vercel!

**Total deployment time: 5-10 minutes**
**DNS propagation time: 24-48 hours**

Once deployed, your app will be:
- ✅ Secure (HTTPS/SSL automatic)
- ✅ Fast (CDN edge locations worldwide)
- ✅ Scalable (auto-scaling)
- ✅ Always available (99.95% uptime SLA)

---

**Questions? Check the Vercel docs:** https://vercel.com/docs/frameworks/nextjs
