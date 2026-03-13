# RedWolf Digital — Website README

Full-service digital marketing agency website for RedWolf Digital, based in Forney, Texas.

**Built with:** Static HTML/CSS/JS · Decap CMS · Netlify Forms · Netlify Scheduled Functions · Anthropic Claude API

---

## Quick Start

### 1. Add Your Logo

Before deploying, place your logo file at:
```
assets/images/logo.png
```
The site is already configured to use `/assets/images/logo.png` throughout. The logo appears in:
- Top-left of the navigation (48px height)
- Footer (56px height)

The site includes an SVG fallback (`logo-placeholder.svg`) that displays automatically if `logo.png` is not found.

---

## Deploying to Netlify

### Step 1: Push to GitHub

Create a new GitHub repository and push this entire project:

```bash
git init
git add .
git commit -m "Initial RedWolf Digital website"
git remote add origin https://github.com/YOUR_USERNAME/redwolf-digital.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in (or create a free account)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Choose your `redwolf-digital` repository
5. Build settings:
   - **Build command:** `echo 'Static site'`
   - **Publish directory:** `.` (a period — the root folder)
6. Click **"Deploy site"**

Netlify will assign you a URL like `https://random-name.netlify.app`. You can change this to a custom domain later.

---

## Enabling Netlify Identity (Required for CMS)

1. In your Netlify dashboard, go to **Site configuration** → **Identity**
2. Click **"Enable Identity"**
3. Under **Registration preferences**, select **"Invite only"** (so only you can log in)
4. Under **Git Gateway**, click **"Enable Git Gateway"** — this allows the CMS to commit changes to your GitHub repo

### Inviting Yourself (CMS Access)

1. Still in **Identity** settings, click **"Invite users"**
2. Enter `marc.trimble@gmail.com`
3. Check your email — you'll receive an invitation link
4. Click the link and set your password
5. You can now log in at `https://yoursite.netlify.app/admin/`

---

## Accessing the CMS

The CMS is available at:
```
https://redwolfdigital.com/admin/
```
(Or your Netlify subdomain: `https://your-site-name.netlify.app/admin/`)

**Login:** Use the email and password you set up via the Netlify Identity invitation.

### What You Can Edit in the CMS:
- **Blog Posts** — Create, edit, and delete blog posts. Add title, date, category, excerpt, SEO title, meta description, and body content (with rich text editor)
- **Home Page** — Hero headline, subheadline, CTAs, stats
- **About Page** — Founder bio (all paragraphs), founder photo, page SEO
- **Services Page** — Page headline and meta
- **Contact Page** — Headline, address, response time, SEO
- **Site Settings** — Site name, tagline, address, footer text, GA4 ID

---

## Setting Environment Variables

In your Netlify dashboard, go to **Site configuration** → **Environment variables**.

### Required for Blog Auto-Generation:
| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | `sk-ant-...` |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope | `ghp_...` |
| `GITHUB_REPO` | Your GitHub repository (owner/repo format) | `yourusername/redwolf-digital` |
| `GITHUB_BRANCH` | Branch to commit new posts to | `main` |

### How to create a GitHub Personal Access Token:
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name like "RedWolf Netlify Blog"
4. Check the **`repo`** scope (full repository access)
5. Click **"Generate token"** and copy it immediately (you won't see it again)
6. Paste it as the `GITHUB_TOKEN` value in Netlify

### How to get your Anthropic API key:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **API Keys**
3. Create a new key and copy it
4. Paste it as `ANTHROPIC_API_KEY` in Netlify

---

## Blog Auto-Generation Schedule

The blog auto-generation function runs automatically:
- **Every Monday at 8:00 AM Central Time**
- **Every Thursday at 8:00 AM Central Time**

Each run generates one new SEO-optimized blog post targeting local Forney/DFW digital marketing topics and commits it to your GitHub repo. Netlify automatically deploys the new post within minutes.

**Topics rotate through 5 categories:**
- Local SEO
- Paid Advertising
- Social Media
- Content Marketing
- Digital Strategy

To manually trigger a post, you can call the function via the Netlify CLI or from the Netlify Functions dashboard.

---

## Netlify Forms — Contact Form Setup

The contact form is already configured with `data-netlify="true"` and will automatically collect submissions in your Netlify dashboard.

### To set up email notifications:
1. In Netlify dashboard, go to **Forms**
2. Click on the **"contact"** form
3. Go to **Settings** → **Form notifications**
4. Click **"Add notification"** → **"Email notification"**
5. Set **"Email to notify"** to `marc.trimble@gmail.com`
6. Save

All form submissions will now be forwarded to your email automatically.

---

## Custom Domain Setup

### If you have a domain (e.g., redwolfdigital.com):
1. In Netlify dashboard, go to **Domain management** → **Add a domain**
2. Enter `redwolfdigital.com`
3. Follow the DNS instructions:
   - **Option A (recommended):** Point your nameservers to Netlify's nameservers
   - **Option B:** Add a CNAME record pointing `www` to your Netlify subdomain, and an A record for the apex domain
4. Netlify automatically provisions a free SSL certificate via Let's Encrypt

---

## File Structure

```
redwolf-digital/
├── index.html              ← Home page
├── netlify.toml            ← Netlify build & function config
├── package.json            ← Node.js dependencies
├── robots.txt              ← SEO: search engine crawl rules
├── sitemap.xml             ← SEO: site map for search engines
├── _redirects              ← Netlify URL redirects
├── README.md               ← This file
│
├── admin/
│   ├── index.html          ← Decap CMS entry point
│   └── config.yml          ← CMS configuration (collections, fields)
│
├── about/
│   └── index.html          ← About page
│
├── blog/
│   ├── index.html          ← Blog index page
│   └── posts/
│       └── *.html          ← Individual blog posts
│
├── contact/
│   └── index.html          ← Contact page with Netlify form
│
├── services/
│   ├── index.html          ← Services overview page
│   ├── forney/index.html   ← Forney, TX service area page
│   ├── terrell/            ← Terrell, TX
│   ├── rockwall/           ← Rockwall, TX
│   ├── heath/              ← Heath, TX
│   ├── fate/               ← Fate, TX
│   ├── kaufman/            ← Kaufman, TX
│   ├── sunnyvale/          ← Sunnyvale, TX
│   └── mesquite/           ← Mesquite, TX
│
├── assets/
│   ├── css/
│   │   ├── base.css        ← CSS reset + design tokens (colors, spacing, fonts)
│   │   └── style.css       ← Component styles
│   ├── js/
│   │   └── main.js         ← Navigation, scroll reveal, form handling
│   └── images/
│       ├── logo.png        ← YOUR LOGO (add this file!)
│       └── logo-placeholder.svg  ← Fallback logo
│
└── netlify/
    └── functions/
        └── generate-blog.js  ← Scheduled blog auto-generation function
```

---

## Customization

### Changing Colors
All colors are defined as CSS custom properties in `assets/css/base.css`:
```css
:root {
  --color-bg:      #080808;   /* Background */
  --color-primary: #E31B1B;   /* Red accent */
  --color-text:    #f0f0f0;   /* Text */
  /* ... */
}
```
Change any color variable to instantly retheme the entire site.

### Changing Fonts
Fonts are imported from Google Fonts in each page's `<head>`. To change:
1. Go to [fonts.google.com](https://fonts.google.com)
2. Select your fonts and copy the import link
3. Replace the Google Fonts link in each HTML file
4. Update `--font-display` and `--font-body` in `assets/css/base.css`

### Adding New Service Area Pages
1. Create a new folder: `services/your-city/`
2. Copy `services/forney/index.html` to `services/your-city/index.html`
3. Find and replace all instances of "Forney" with your city name
4. Update the meta description, canonical URL, and page title
5. Update the sitemap.xml to include the new URL
6. Add a link to the new page in the footer

---

## SEO Notes

- Every page has a unique `<title>` tag in the format: `Page Name | RedWolf Digital — Forney, TX`
- Every page has a unique `<meta name="description">` tag
- Open Graph tags are included on all pages
- JSON-LD structured data (`LocalBusiness` schema) is on the homepage and contact page
- `robots.txt` allows all crawlers, blocks `/admin/`
- `sitemap.xml` includes all static pages

---

## Support

For questions about this website build, contact the development team.

Built with ❤️ by [Perplexity Computer](https://www.perplexity.ai/computer).
