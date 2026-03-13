/**
 * =====================================================
 * REDWOLF DIGITAL — BLOG AUTO-GENERATION FUNCTION
 * =====================================================
 * Netlify Scheduled Function
 * Runs: Monday & Thursday at 8:00 AM Central Time
 * 
 * What it does:
 * 1. Calls Anthropic Claude API to generate an SEO-optimized blog post
 * 2. Targets local Forney/DFW digital marketing topics
 * 3. Commits the new .html file to GitHub via the API
 * 4. Netlify auto-deploys on commit
 *
 * Required Environment Variables (set in Netlify dashboard):
 *   ANTHROPIC_API_KEY  — Your Anthropic API key
 *   GITHUB_TOKEN       — GitHub Personal Access Token (repo write access)
 *   GITHUB_REPO        — GitHub repo (e.g., "yourusername/redwolf-digital")
 *   GITHUB_BRANCH      — Branch to commit to (default: "main")
 *
 * Schedule: "0 14 * * 1,4" (Monday & Thursday 8am CT = 14:00 UTC)
 * =====================================================
 */

const schedule = require("@netlify/functions");

// Topic rotation to keep posts varied
const TOPIC_CATEGORIES = [
  {
    category: "local-seo",
    categoryLabel: "Local SEO",
    topics: [
      "Google Business Profile optimization tips for Forney TX businesses",
      "Local SEO strategies for Kaufman County service businesses",
      "How to rank in the Google Maps 3-Pack in DFW",
      "Voice search optimization for 'near me' queries in Forney",
      "Local citation building strategies for East Texas businesses",
      "How Google Reviews impact local search rankings in DFW",
      "Service area pages that rank: a guide for Forney businesses",
      "Hyperlocal keyword research for Rockwall and Heath TX",
    ]
  },
  {
    category: "paid-advertising",
    categoryLabel: "Paid Advertising",
    topics: [
      "Google Local Services Ads for DFW home service businesses",
      "How to set up geofenced Google Ads targeting Forney TX",
      "Facebook radius targeting strategies for local businesses in Kaufman County",
      "Retargeting campaigns that convert local website visitors",
      "Google Display Ads for brand awareness in the Forney area",
      "Nextdoor advertising guide for small businesses in DFW suburbs",
      "Seasonal PPC strategies for Texas home services businesses",
    ]
  },
  {
    category: "social-media",
    categoryLabel: "Social Media",
    topics: [
      "How Forney TX businesses can use Nextdoor to drive word-of-mouth referrals",
      "Short-form video marketing for local businesses: Reels and TikTok guide",
      "Facebook community marketing for Kaufman County businesses",
      "Instagram strategy for home services businesses in the DFW area",
      "Social media content calendar for DFW local businesses",
      "How to use local Facebook groups to grow your Forney business",
    ]
  },
  {
    category: "content-marketing",
    categoryLabel: "Content Marketing",
    topics: [
      "How to write service area pages that rank in Forney, Heath, and Rockwall TX",
      "Content marketing strategy for local businesses in fast-growing Texas suburbs",
      "FAQ page SEO for DFW service businesses",
      "Neighborhood spotlight content strategy for local businesses",
      "Blog content ideas for Forney TX business owners",
      "How to create locally-relevant content that ranks in Google",
    ]
  },
  {
    category: "digital-strategy",
    categoryLabel: "Digital Strategy",
    topics: [
      "Complete digital marketing checklist for Forney TX small businesses",
      "How to audit your digital marketing presence as a DFW business",
      "Google Analytics 4 setup guide for local businesses in Kaufman County",
      "CRM setup for home services businesses in the DFW area",
      "Lead tracking strategies for local businesses in fast-growing Texas markets",
      "Reputation management strategy for DFW businesses",
      "Email marketing for local businesses in Forney and East DFW",
    ]
  }
];

/**
 * Get the next topic to write about using a rotation index
 * stored in a simple modular counter (week number mod total topics)
 */
function getNextTopic() {
  const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const allTopics = TOPIC_CATEGORIES.flatMap(cat => 
    cat.topics.map(topic => ({ topic, category: cat.category, categoryLabel: cat.categoryLabel }))
  );
  const index = weekNumber % allTopics.length;
  return allTopics[index];
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
}

/**
 * Generate the blog post HTML using Claude
 */
async function generateBlogPost(topicInfo) {
  const { topic, category, categoryLabel } = topicInfo;
  const date = new Date().toISOString().split('T')[0];
  
  const systemPrompt = `You are an expert digital marketing content writer specializing in local SEO and DFW-area marketing content for RedWolf Digital, a full-service digital marketing agency based in Forney, Texas.

Write professional, SEO-optimized blog posts that:
- Target local Forney, TX and DFW area search intent
- Reference specific local areas: Forney, Terrell, Rockwall, Heath, Fate, Kaufman County, DFW
- Are written for local business owners (not marketing professionals)
- Include practical, actionable advice
- Use H2 and H3 headings for structure
- Are 800-1200 words in length
- End with a clear CTA to contact RedWolf Digital
- Are professional but not stuffy in tone`;

  const userPrompt = `Write a complete, SEO-optimized blog post about: "${topic}"

Category: ${categoryLabel}

The post must include:
1. A compelling title (include "Forney TX" or another DFW city when natural)
2. A 150-character meta description
3. A URL slug
4. An introductory paragraph (don't use the word "Introduction" as a heading)
5. 3-5 H2 sections with H3 subsections where appropriate
6. Practical, specific advice (not generic)
7. Local references to Forney, DFW, or nearby cities where relevant
8. A concluding paragraph with a CTA to contact RedWolf Digital at /contact/
9. 3-5 tags

Respond ONLY with a JSON object in this exact format:
{
  "title": "Full Blog Post Title",
  "slug": "url-friendly-slug",
  "meta_description": "150 character description",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"],
  "body_html": "Full HTML content with proper h2/h3/p/ul/ol tags — do NOT include title or meta in the body"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Parse the JSON response
  let post;
  try {
    // Extract JSON from the response (handle potential markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
    const jsonStr = jsonMatch[1].trim();
    post = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse Claude response as JSON: ${e.message}`);
  }

  return post;
}

/**
 * Build the full HTML file for the blog post
 */
function buildPostHTML(post, date) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} | RedWolf Digital — Forney, TX</title>
<meta name="description" content="${post.meta_description}">
<meta property="og:title" content="${post.title} | RedWolf Digital">
<meta property="og:description" content="${post.meta_description}">
<meta property="og:type" content="article">
<meta name="generator" content="RedWolf Digital Blog Auto-Generator">
<link rel="canonical" href="https://redwolfdigital.com/blog/posts/${post.slug}.html">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${post.title.replace(/"/g, '\\"')}","datePublished":"${date}","author":{"@type":"Organization","name":"RedWolf Digital"},"publisher":{"@type":"Organization","name":"RedWolf Digital","url":"https://redwolfdigital.com"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="nav__inner">
    <a href="../../" class="nav__logo" aria-label="RedWolf Digital - Home">
      <img src="../../assets/images/logo.png" alt="RedWolf Digital" onerror="this.src='../../assets/images/logo-placeholder.svg'" height="48">
    </a>
    <ul class="nav__links" role="list">
      <li><a href="../../services/">Services</a></li>
      <li><a href="../../about/">About</a></li>
      <li><a href="../../blog/" class="active">Blog</a></li>
      <li><a href="../../contact/">Contact</a></li>
    </ul>
    <div class="nav__cta"><a href="../../contact/" class="btn btn--primary">Get Started</a></div>
    <button class="nav__hamburger" aria-label="Toggle navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</nav>
<nav class="nav__mobile" aria-label="Mobile navigation">
  <a href="../../services/">Services</a>
  <a href="../../about/">About</a>
  <a href="../../blog/">Blog</a>
  <a href="../../contact/">Contact</a>
  <a href="../../contact/" class="btn btn--primary" style="margin-top:1rem;text-align:center;justify-content:center;">Get Started</a>
</nav>
<main>
<article>
<header class="blog-post__header">
  <div class="page-hero__bg-grid" aria-hidden="true"></div>
  <div class="container" style="position:relative;z-index:1;">
    <div class="breadcrumb">
      <a href="../../">Home</a>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
      <a href="../../blog/">Blog</a>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
      <span>${post.categoryLabel || post.category}</span>
    </div>
    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5);">
      <span class="blog-card__cat" style="font-size:var(--text-xs);">${post.categoryLabel || post.category}</span>
      <span style="color:var(--color-text-faint);font-size:var(--text-xs);">|</span>
      <time datetime="${date}" style="font-size:var(--text-xs);color:var(--color-text-faint);">${formattedDate}</time>
    </div>
    <h1 style="font-size:var(--text-3xl);max-width:760px;margin-bottom:var(--space-4);">${post.title}</h1>
    <p style="font-size:var(--text-base);color:var(--color-text-muted);max-width:640px;line-height:1.6;">${post.meta_description}</p>
    <div style="margin-top:var(--space-6);display:flex;align-items:center;gap:var(--space-4);">
      <div style="width:40px;height:40px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div>
        <div style="font-family:var(--font-display);font-size:var(--text-sm);letter-spacing:0.05em;">RedWolf Digital</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-faint);">Forney, TX</div>
      </div>
    </div>
  </div>
</header>
<div class="blog-post__content">
${post.body_html}
<div class="blog-post__share">
  <span class="share-label">Share:</span>
  <a href="https://twitter.com/intent/tweet?url=https://redwolfdigital.com/blog/posts/${post.slug}.html" target="_blank" rel="noopener noreferrer" class="share-btn">X / Twitter</a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=https://redwolfdigital.com/blog/posts/${post.slug}.html" target="_blank" rel="noopener noreferrer" class="share-btn">Facebook</a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://redwolfdigital.com/blog/posts/${post.slug}.html" target="_blank" rel="noopener noreferrer" class="share-btn">LinkedIn</a>
</div>
</div>
<section class="cta-band">
  <div class="container">
    <div class="cta-band__inner">
      <h2 class="cta-band__title">Ready to Put This Into Practice?</h2>
      <p class="cta-band__sub">Get a free digital marketing strategy session for your Forney or DFW business.</p>
      <a href="../../contact/" class="btn btn--outline btn--lg">Get Your Free Strategy Session</a>
    </div>
  </div>
</section>
</article>
</main>
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__logo-col">
        <a href="../../" class="footer__logo"><img src="../../assets/images/logo.png" alt="RedWolf Digital" onerror="this.src='../../assets/images/logo-placeholder.svg'" height="56"></a>
        <p class="footer__tagline">Enterprise-level digital marketing for local businesses. Forney, TX.</p>
      </div>
      <div>
        <h3 class="footer__heading">Services</h3>
        <ul class="footer__links" role="list">
          <li><a href="../../services/#search-visibility">Local SEO</a></li>
          <li><a href="../../services/#paid-advertising">Paid Advertising</a></li>
          <li><a href="../../services/#website-presence">Website Design</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer__heading">Company</h3>
        <ul class="footer__links" role="list">
          <li><a href="../../about/">About</a></li>
          <li><a href="../../blog/">Blog</a></li>
          <li><a href="../../contact/">Contact</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer__heading">Contact</h3>
        <div class="footer__contact-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Forney, Texas 75126</span>
        </div>
        <div class="footer__contact-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="../../contact/">Start a project</a>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; ${new Date().getFullYear()} RedWolf Digital. All rights reserved.</span>
      <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer">Created with Perplexity Computer</a>
    </div>
  </div>
</footer>
<script>document.getElementById && (document.getElementById('year') || {}).textContent && (document.getElementById('year').textContent = new Date().getFullYear());</script>
<script src="../../assets/js/main.js" defer></script>
</body>
</html>`;
}

/**
 * Commit a file to GitHub via the REST API
 */
async function commitToGitHub(filename, content) {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;
  const filePath = `blog/posts/${filename}`;
  
  // Check if file already exists (to get its SHA for update)
  let existingSha = null;
  try {
    const checkResponse = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      existingSha = existing.sha;
    }
  } catch (e) {
    // File doesn't exist yet — that's fine
  }

  const body = {
    message: `Auto-generate blog post: ${filename}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };
  
  if (existingSha) body.sha = existingSha;

  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} — ${error}`);
  }

  return await response.json();
}

/**
 * Main handler — called by Netlify on schedule
 */
exports.handler = async function(event) {
  console.log('RedWolf Digital Blog Generator — Starting...');
  
  // Verify required env vars
  const required = ['ANTHROPIC_API_KEY', 'GITHUB_TOKEN', 'GITHUB_REPO'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return { statusCode: 500, body: `Missing env vars: ${missing.join(', ')}` };
  }

  try {
    const date = new Date().toISOString().split('T')[0];
    const topicInfo = getNextTopic();
    
    console.log(`Generating post about: "${topicInfo.topic}"`);
    
    // Generate post content using Claude
    const post = await generateBlogPost(topicInfo);
    console.log(`Generated: "${post.title}"`);
    
    // Build the HTML file
    const html = buildPostHTML(post, date);
    const filename = `${post.slug}.html`;
    
    // Commit to GitHub
    const result = await commitToGitHub(filename, html);
    console.log(`Successfully committed: ${filename}`);
    console.log(`GitHub commit SHA: ${result.commit.sha}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        title: post.title,
        slug: post.slug,
        filename,
        commit: result.commit.sha,
      })
    };
    
  } catch (error) {
    console.error('Blog generation failed:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
