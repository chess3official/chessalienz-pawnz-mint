# Push to GitHub Instructions

## ✅ Git Repository Initialized

Your local Git repository has been initialized and committed!

## 🚀 Next Steps: Push to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - Sign in if needed

2. **Create Repository:**
   - Repository name: `chessalienz-pawnz-mint`
   - Description: `Chessalienz: Pawnz NFT mint page on Solana`
   - Visibility: **Private** (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Push Your Code:**
   
   Copy the commands GitHub shows you, or use these:
   
   ```bash
   # Add GitHub as remote
   git remote add origin https://github.com/YOUR_USERNAME/chessalienz-pawnz-mint.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

### Option 2: Use Existing Repository

If you already have a repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 📋 After Pushing to GitHub

### 1. Verify Push
- Go to your GitHub repository
- Confirm all files are there
- Check that `.env.local` is NOT in the repo (it's gitignored)

### 2. Deploy to Vercel

**Import from GitHub:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `chessalienz-pawnz-mint` repo
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Add Environment Variables:**

In Vercel project settings, add:

```
NEXT_PUBLIC_MINT_PHASE=CLOSED
NEXT_PUBLIC_PUBLIC_MINT_PRICE=0.5
NEXT_PUBLIC_USE_SNAPSHOT=true
NEXT_PUBLIC_COLLECTION_MINT=4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C
NEXT_PUBLIC_COLLECTION_NAME=Chessalienz: Pawnz
NEXT_PUBLIC_COLLECTION_SYMBOL=PAWNZ
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c
ADMIN_SECRET=your-secret-key-change-this
```

⚠️ **Important:** Change `ADMIN_SECRET` to a secure random string!

**Deploy:**
- Click "Deploy"
- Wait for build to complete (~2-3 minutes)
- Your mint page is live!

### 3. Set Up Custom Domain

**For subdomain (mint.chessalienzpawnz.com):**

1. In Vercel project → Settings → Domains
2. Add domain: `mint.chessalienzpawnz.com`
3. Vercel provides DNS records
4. Add CNAME record to your domain provider:
   - Type: `CNAME`
   - Name: `mint`
   - Value: `cname.vercel-dns.com`

---

## 🔄 Future Updates

### Making Changes:

```bash
# Make your code changes
# Then commit and push:

git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy your changes!

### Changing Mint Phase:

**Option A: Via Vercel Dashboard**
1. Go to project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_MINT_PHASE` to `PRESALE` or `PUBLIC`
3. Redeploy

**Option B: Via Code**
1. Update `.env.local` (but don't commit it)
2. Or update `vercel.json`
3. Push to GitHub

---

## 📝 Quick Commands Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## 🔐 Security Reminders

✅ `.env.local` is gitignored (sensitive data protected)  
✅ Use Vercel environment variables for production  
✅ Never commit API keys or secrets  
✅ Keep `ADMIN_SECRET` secure  

---

## ✨ You're Ready!

Your mint page is:
- ✅ Committed to Git
- ⏳ Ready to push to GitHub
- ⏳ Ready to deploy to Vercel

Follow the steps above to complete deployment! 🚀
