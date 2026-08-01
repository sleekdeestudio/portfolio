import fs from "node:fs/promises";
import path from "node:path";
import { projectOrder, projects, site, workItems } from "../data/projects.mjs";

const root = path.resolve(".");
const manifest = JSON.parse(await fs.readFile(path.join(root, "assets/manifest.json"), "utf8"));
const year = new Date().getFullYear();
const buildDate = new Date().toISOString().slice(0, 10);

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const assetPath = (source) => source === "assets/logo.png"
  ? source
  : source.replace(/\.(?:jpe?g|png|webp)$/i, ".webp");

const prefixFor = (level) => "../".repeat(level);

function image(source, alt, level, { lazy = true, className = "" } = {}) {
  const optimized = assetPath(source);
  const metadata = manifest[optimized];
  if (!metadata) throw new Error(`No metadata found for ${optimized}`);
  return `<img src="${prefixFor(level)}${optimized}" alt="${escapeHtml(alt)}" width="${metadata.width}" height="${metadata.height}"${className ? ` class="${className}"` : ""}${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
}

const external = (href, label, className = "") => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener"${className ? ` class="${className}"` : ""}>${label}</a>`;

const icons = {
  pen: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  email: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  instagram: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="6"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>',
  linkedin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
  download: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>'
};

function documentHead({ title, description, canonical, ogImage, level, type = "website", base = false, schema = "" }) {
  const prefix = prefixFor(level);
  const imageUrl = `${site.baseUrl}${assetPath(ogImage)}`;
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#130d0c">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${canonical}">
  ${base ? '<base href="/portfolio/">' : ""}
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="SleekDee">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" type="image/png" href="${base ? "assets/favicon.png" : `${prefix}assets/favicon.png`}">
  <link rel="apple-touch-icon" href="${base ? "assets/apple-touch-icon.png" : `${prefix}assets/apple-touch-icon.png`}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&amp;family=Hanken+Grotesk:wght@400;600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base ? "styles.css" : `${prefix}styles.css`}">
  ${schema}
</head>`;
}

function pathsFor(level, current) {
  if (level === 0) return { home: "./", work: "work/", contact: "#contact" };
  if (level === 1) return { home: "../", work: "./", contact: "../#contact" };
  return { home: "../../", work: "../", contact: "../../#contact" };
}

function siteNav(level, current) {
  const paths = pathsFor(level, current);
  return `<nav class="site-nav" aria-label="Primary">
  <a class="wordmark" href="${paths.home}">${site.name}</a>
  <div class="nav-actions">
    <a class="btn btn-primary" href="${paths.contact}">Let's talk</a>
    <button class="btn menu-button" type="button" aria-expanded="false" aria-controls="menu-overlay" data-menu-open>MENU</button>
  </div>
</nav>`;
}

function menuOverlay(level, current) {
  const paths = pathsFor(level, current);
  const links = [
    ["01", "home", paths.home, current === "home"],
    ["02", "work", paths.work, current === "work"],
    ["03", "services", `${paths.home}#services`, false],
    ["04", "process", `${paths.home}#process`, false],
    ["05", "about", `${paths.home}#about`, false],
    ["06", "contact", paths.contact, false]
  ];
  return `<div class="menu-overlay" id="menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu" data-menu hidden>
  <div class="menu-head">
    <span class="wordmark">${site.name}</span>
    <button class="btn menu-close" type="button" data-menu-close>CLOSE ✕</button>
  </div>
  <nav class="menu-links" aria-label="Menu">
    ${links.map(([number, label, href, active], index) => `<a class="menu-delay-${index + 1}" href="${href}"${active ? ' aria-current="page"' : ""}><span class="menu-number">(${number})</span>${label}${active ? " ←" : ""}</a>`).join("\n    ")}
  </nav>
  <div class="menu-foot">
    <span>(follow)</span>
    ${external(site.socials.instagram, "Instagram")}
    ${external(site.socials.linkedin, "LinkedIn")}
    ${external(site.socials.behance, "Behance")}
    ${external(site.socials.portfolio, "Portfolio")}
    <a class="menu-email" href="mailto:${site.email}">${site.email}</a>
  </div>
</div>`;
}

function footer(level, variant = "home") {
  const paths = pathsFor(level, variant);
  const tail = variant === "home"
    ? '<span class="push">Made to be scrolled.</span><a href="#top">Back to top ↑</a>'
    : `<a class="push" href="${paths.home}">← Back home</a>`;
  return `<footer class="container site-footer">
  <strong>${site.name}</strong>
  <span>© <span data-year>${year}</span></span>
  ${tail}
</footer>`;
}

function pageShell({ level, current, head, main, footerVariant = current, base404 = false }) {
  const scriptSource = base404 ? "site.js" : `${prefixFor(level)}site.js`;
  return `${head}
<body id="top">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="site-shell">
    <canvas class="doodle-canvas" aria-hidden="true" data-doodle></canvas>
    <div class="site-layer">
      ${siteNav(level, current)}
      <main id="main">${main}</main>
      ${footer(level, footerVariant)}
    </div>
    ${menuOverlay(level, current)}
  </div>
  <script src="${scriptSource}" defer></script>
</body>
</html>\n`;
}

const features = [
  {
    slug: "woop",
    className: "",
    image: "assets/woop/wp-a.jpg",
    alt: "Woop energy drink brand identity, packaging and campaign",
    badge: "Featured — brand identity",
    title: "woop",
    description: "An energy drink built from scratch — wordmark, three flavours, cans, and a campaign loud enough to hold a billboard.",
    tags: ["Identity", "Packaging"],
    cta: "See the whole brand"
  },
  {
    slug: "sapphire",
    className: "feature-light",
    image: "assets/sapphire/sp-hero.png",
    alt: "Sapphire Coffee and Culture brand and packaging design",
    badge: "New — packaging design",
    title: "sapphire coffee & culture",
    description: "A whole identity and packaging range — mark, palette, engraved skyline, cups, bags, aprons and shopfront. Joy in every cup.",
    tags: ["Identity", "Packaging"],
    cta: "See the full brand"
  },
  {
    slug: "ernest-jones",
    className: "feature-ivory",
    image: "assets/ernest/ej-banner-1.png",
    alt: "Ernest Jones Circle of Light campaign banner",
    badge: "New — social media post design",
    title: "ernest jones",
    description: "Two campaigns of post design for a jeweller — gold and silver, warm light and cold, one piece given the whole frame.",
    tags: ["Post design", "Banners"],
    cta: "See all the posts"
  }
];

function renderFeature(feature) {
  return `<a class="feature-card ${feature.className}" href="work/${feature.slug}/">
  <figure class="feature-image">
    ${image(feature.image, feature.alt, 0)}
    <span class="feature-badge">${feature.badge}</span>
  </figure>
  <div class="feature-copy">
    <div>
      <h3>${escapeHtml(feature.title)}</h3>
      <p>${escapeHtml(feature.description)}</p>
    </div>
    <div class="feature-action">
      <div class="feature-tags">${feature.tags.map((tag) => `<span class="feature-tag">${tag}</span>`).join("")}</div>
      <span class="feature-cta">${feature.cta} <span aria-hidden="true">→</span></span>
    </div>
  </div>
</a>`;
}

function workCard(item, level, location = "work") {
  const href = location === "home" ? `work/${item.slug}/` : `${item.slug}/`;
  const wide = item.layout.includes("wide");
  const mediaClasses = [
    "work-media",
    item.layout.includes("triptych") ? "triptych" : "",
    item.layout.includes("contain") ? "contain" : "",
    item.layout.includes("landscape") ? "landscape" : "",
    item.layout.includes("warm") ? "warm" : "",
    item.layout.includes("cream") ? "cream" : ""
  ].filter(Boolean).join(" ");
  return `<article class="work-card${wide ? " wide" : ""}">
  <a href="${href}" aria-label="View ${escapeHtml(item.title)} case study">
    <figure class="${mediaClasses}">
      ${item.images.map((source, index) => image(source, item.alts[index], level)).join("\n      ")}
    </figure>
  </a>
  <div class="work-meta">
    <span class="work-number">${item.number}</span>
    <div class="work-copy">
      <h2><a href="${href}">${escapeHtml(item.title)}</a></h2>
      <p>${escapeHtml(item.description)}</p>
    </div>
    <div class="work-tags">${item.tags.map((tag, index) => `<span class="tag ${index ? "tag-outline" : item.tags[0] === "Growth" ? "tag-red" : "tag-accent"}">${tag}</span>`).join("")}</div>
  </div>
</article>`;
}

function homePage() {
  const description = "SleekDee is Tirth Mody's UK-based one-person design studio for brand identity, packaging, social media, photography and content.";
  const schema = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    email: `mailto:${site.email}`,
    telephone: site.phoneHref,
    url: site.baseUrl,
    jobTitle: "Brand designer and photographer",
    sameAs: Object.values(site.socials)
  })}</script>`;
  const head = documentHead({
    title: "Tirth Mody — Brand designer & photographer | SleekDee",
    description,
    canonical: site.baseUrl,
    ogImage: "assets/woop/wp-a.jpg",
    level: 0,
    schema
  });

  const services = [
    ["01", "Brand design", "Logos, identities and full systems with a point of view — built to be recognised at thumbnail size."],
    ["02", "Social media marketing", "Feeds planned, posted and grown — calendars, captions, community. I run it so you can run the business."],
    ["03", "Photography & videography", "Product, food and live events. I shoot what I design, so the grid always matches the brand."],
    ["04", "Content creation", "Reels, campaigns and posts that sound like you — made in batches, shipped on schedule."],
    ["05", "Product & packaging design", "Cards, boxes and labels people keep. Shelf presence you can feel in the hand."]
  ];
  const process = [
    ["01", "We talk", "A call or a coffee. You tell me what you're building and what's in the way; I ask too many questions."],
    ["02", "I sketch", "Moodboards and rough routes in days, not weeks. We pick a direction before anything gets precious."],
    ["03", "I make", "Design, shoot, write, build — one pair of hands end to end, so nothing gets lost in handover."],
    ["04", "It grows", "Launch is the start. We post, measure and sharpen what works until the numbers move."]
  ];
  const brandNames = ["Marshall", "Interior Goods Direct", "Sapphire", "Ernest Jones", "Pringles"];
  const marquee = `<div class="marquee-row">${brandNames.map((brand) => `<span>${brand}</span><span class="marquee-dot"></span>`).join("")}</div>`;
  const selectedWork = workItems.slice(0, 5).map((item) => workCard(item, 0, "home")).join("\n");

  const main = `
<section class="container hero" aria-labelledby="hero-title">
  <div>
    <h1 id="hero-title"><span>I build brands</span><span>that look <span class="sharp" data-sharp>sharp</span></span><span>and grow online.</span></h1>
    <p class="hero-copy">I'm Tirth Mody — the designer and photographer behind SleekDee. Identities, feeds, packaging and photographs that pull their weight: work that looks good and sells harder.</p>
    <div class="tag-row"><span class="tag tag-accent">Designer</span><span class="tag tag-red">Photographer</span><span class="tag tag-neutral">One-person studio</span></div>
    <div class="button-row"><a class="btn btn-primary" href="#contact">Let's work together</a><a class="btn btn-ghost" href="#work">See the work</a></div>
  </div>
  <div class="hero-art" aria-hidden="true">
    <span class="hero-orb" data-parallax data-parallax-x="26" data-parallax-y="18" data-parallax-rotate="10" data-parallax-scroll="0.06"></span>
    <span class="hero-ring" data-parallax data-parallax-x="-34" data-parallax-y="-24" data-parallax-rotate="14" data-parallax-scroll="0.11"></span>
    <div class="camera-wrap" data-parallax data-parallax-x="44" data-parallax-y="30" data-parallax-rotate="8" data-parallax-scroll="0.16"><div class="camera"><span class="camera-lens"></span><span class="camera-rec"></span><span class="camera-brand">SONY</span></div><span class="camera-label">shot on my ZV-E10</span></div>
    <span class="hero-tile" data-parallax data-parallax-x="-52" data-parallax-y="-38" data-parallax-rotate="6" data-parallax-scroll="0.22">${icons.pen}</span>
    <svg class="hero-cursor" data-parallax data-parallax-x="40" data-parallax-y="-30" data-parallax-rotate="9" data-parallax-scroll="0.19" width="34" height="34" viewBox="0 0 24 24" fill="var(--color-accent-2)" stroke="#260f0b" stroke-width="1.5" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg>
    <span class="hero-shadow"></span>
  </div>
</section>
<section class="client-strip" aria-label="Clients">
  <p class="eyebrow client-label">Brands I've grown</p>
  <div class="marquee">${marquee}<div aria-hidden="true">${marquee}</div></div>
</section>
<section class="container feature-stack" aria-label="Featured work">${features.map(renderFeature).join("\n")}</section>
<section class="container section" id="services">
  <p class="eyebrow">Services</p><h2 class="section-title">What I do all day</h2>
  <div class="service-list">${services.map(([number, title, copy]) => `<article class="service-row"><span class="service-number">${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div>
</section>
<section class="container section" id="work">
  <div class="section-head"><div><p class="eyebrow">Selected work</p><h2 class="section-title">Things I've made lately</h2></div><p class="section-aside">Identity, campaign, content and photography — all from the same pair of hands.</p></div>
  <div class="work-grid">${selectedWork}<div class="work-cta"><span class="mini-orb" aria-hidden="true"></span><h3>This spot is for your project.</h3><a class="btn btn-secondary" href="#contact">Let's fill it</a></div></div>
  <div class="center-action"><a class="btn btn-ghost" href="work/">Show me more work →</a></div>
</section>
<section class="container section" id="process">
  <p class="eyebrow">How we'll work</p><h2 class="section-title">Four steps, no mystery</h2>
  <div class="process-grid">${process.map(([number, title, copy]) => `<article class="process-step"><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div>
</section>
<section class="container section about" id="about">
  <div class="portrait-wrap"><figure class="portrait">${image("assets/portrait.webp", "Portrait of Tirth Mody", 0)}</figure></div>
  <div class="about-copy"><p class="eyebrow">The person behind it</p><h2 class="section-title">Hi, I'm Tirth.</h2><p>SleekDee is my one-person studio. I spend my days designing brands and my evenings photographing them — which means the logo, the packaging, the feed and the photos all come from the same pair of eyes, and it shows.</p><p>Based in the UK, working with small businesses everywhere that are ready to look like the brand they already are.</p><div class="button-row">${external(site.socials.portfolio, `${icons.download}Portfolio`, "btn btn-primary")}${external(site.socials.behance, "Bē&nbsp;&nbsp;Behance", "btn btn-ghost")}${external(site.socials.linkedin, "LinkedIn", "btn btn-ghost")}${external(site.socials.instagram, "Instagram", "btn btn-ghost")}</div></div>
</section>
<section class="container section" id="testimonials">
  <p class="eyebrow">Kind words</p><h2 class="section-title">What clients say after</h2>
  <div class="testimonial-grid">
    <article class="testimonial"><div class="testimonial-inner"><span class="quote-mark" aria-hidden="true">“</span><blockquote>Tirth took our feed from “posting when we remember” to a machine. Enquiries doubled in three months — and it still looks like us.</blockquote><cite>Marshall</cite><svg class="quote-line" viewBox="0 0 92 12" fill="none" aria-hidden="true"><path d="M2 8 Q 12 2, 22 8 T 42 8 T 62 8 T 82 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><small>Social media marketing</small></div></article>
    <article class="testimonial"><div class="testimonial-inner"><span class="quote-mark" aria-hidden="true">“</span><blockquote>The feed redesign paid for itself. One cohesive grid, and suddenly we look like the premium brand we always were.</blockquote><cite>Interior Goods Direct</cite><svg class="quote-line" viewBox="0 0 92 12" fill="none" aria-hidden="true"><path d="M2 8 Q 12 2, 22 8 T 42 8 T 62 8 T 82 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><small>Feed redesign</small></div></article>
  </div>
</section>
<section class="container section" id="contact">
  <div class="contact-panel">
    <div><h2>Impressed? Let's cross paths.</h2><p>Tell me what you're making and I'll reply within a day — usually faster. No decks, no account managers, just me.</p><div class="contact-links"><a href="mailto:${site.email}">${icons.email}${site.email}</a><a href="tel:${site.phoneHref}">${icons.phone}${site.phone}</a>${external(site.socials.instagram, `${icons.instagram}@tirthmody`)}${external(site.socials.linkedin, `${icons.linkedin}in/tirthmodi`)}${external(site.socials.behance, "Bē&nbsp;&nbsp;behance.net/tirthmody1")}${external(site.socials.portfolio, `${icons.download}Full portfolio`)}</div></div>
    <aside class="contact-cta"><span class="availability"><span class="availability-dot"></span>Available for select projects</span><h3>Have a brief, a half-formed idea, or a brand that needs a sharper edge?</h3><p>Email is the fastest way to start. Include your timeline and what success should look like.</p><a class="btn btn-primary" href="mailto:${site.email}?subject=New%20project%20for%20SleekDee">Start a conversation</a></aside>
  </div>
</section>`;
  return pageShell({ level: 0, current: "home", head, main });
}

function workPage() {
  const description = "Explore seven SleekDee case studies spanning brand identity, packaging, social content, campaign design and photography.";
  const head = documentHead({
    title: "Selected work — Tirth Mody | SleekDee",
    description,
    canonical: `${site.baseUrl}work/`,
    ogImage: "assets/pringles/cover-11.jpg",
    level: 1
  });
  const main = `
<section class="container page-hero">
  <p class="eyebrow">Work</p><h1>Work that earns attention — and keeps it.</h1><p class="lead">Seven case studies across brand identity, packaging, campaigns and content — designed, photographed and delivered by one pair of hands.</p>
</section>
<section class="container all-work" aria-label="All projects"><div class="work-grid">${workItems.map((item) => workCard(item, 1)).join("\n")}</div></section>
<section class="container work-page-cta"><div class="work-page-panel"><h2>Your brand could be next. Let's make it impossible to scroll past.</h2><a class="btn btn-primary" href="../#contact">Start a project</a></div></section>`;
  return pageShell({ level: 1, current: "work", head, main });
}

function ratioClass(ratio) {
  if (ratio === "1 / 1") return "ratio-square";
  if (ratio === "3 / 4") return "ratio-three-four";
  return "ratio-four-five";
}

function renderGallery(project, level) {
  let currentSection = "campaign";
  let visualIndex = 0;
  return project.blocks.map((block) => {
    if (block.type === "section") {
      currentSection = block.title;
      return `<header class="gallery-section"><h2>${escapeHtml(block.title)}</h2><p class="note">${escapeHtml(block.note)}</p><p class="count">${escapeHtml(block.count)}</p></header>`;
    }
    if (block.type === "image" || block.type === "bare") {
      visualIndex += 1;
      const alt = `${project.title} — ${currentSection} visual ${visualIndex}`;
      return `<figure class="gallery-image${block.type === "bare" ? " bare" : ""}">${image(block.src, alt, level)}</figure>`;
    }
    if (block.type === "row") {
      return `<div class="gallery-row cols-${block.columns} ${ratioClass(block.ratio)}">${block.sources.map((source) => {
        visualIndex += 1;
        return `<figure class="gallery-image">${image(source, `${project.title} — ${currentSection} visual ${visualIndex}`, level)}</figure>`;
      }).join("")}</div>`;
    }
    throw new Error(`Unknown gallery block: ${block.type}`);
  }).join("\n");
}

function projectPage(slug) {
  const project = projects[slug];
  const index = projectOrder.indexOf(slug);
  const previousSlug = projectOrder[(index - 1 + projectOrder.length) % projectOrder.length];
  const nextSlug = projectOrder[(index + 1) % projectOrder.length];
  const previous = projects[previousSlug];
  const next = projects[nextSlug];
  const description = project.summary[0].length > 155 ? `${project.summary[0].slice(0, 152).trimEnd()}…` : project.summary[0];
  const canonical = `${site.baseUrl}work/${slug}/`;
  const schema = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    creator: { "@type": "Person", name: site.name, url: site.baseUrl },
    description,
    url: canonical,
    image: `${site.baseUrl}${assetPath(project.og)}`
  })}</script>`;
  const head = documentHead({
    title: `${project.title} — Case study | SleekDee`,
    description,
    canonical,
    ogImage: project.og,
    level: 2,
    type: "article",
    schema
  });
  const main = `
<article>
  <header class="container container-narrow project-hero"><a class="back-link" href="../">← all work</a><p class="project-number">${project.number}</p><h1>${escapeHtml(project.title)}</h1><p class="project-meta">${escapeHtml(project.meta)}</p></header>
  <section class="container container-narrow project-details" aria-label="Project details"><div class="project-detail-grid"><div class="summary"><p class="detail-label">(project summary)</p>${project.summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div><div><p class="detail-label">(project segments)</p><div class="detail-list">${project.segments.map((segment) => `<p>${escapeHtml(segment)}</p>`).join("")}</div></div><div><p class="detail-label">(niche)</p><div class="detail-list"><p>${escapeHtml(project.niche)}</p></div></div></div></section>
  <section class="container container-narrow project-gallery" aria-label="Project gallery">${renderGallery(project, 2)}</section>
  <footer class="container container-narrow project-footer"><nav class="project-nav" aria-label="Adjacent case studies"><a href="../${previousSlug}/">← ${escapeHtml(previous.title)}</a><a href="../${nextSlug}/">${escapeHtml(next.title)} →</a></nav><div class="center-action"><a class="btn btn-primary" href="../../#contact">Want yours next? Let's talk</a></div></footer>
</article>`;
  return pageShell({ level: 2, current: "project", head, main, footerVariant: "project" });
}

function errorPage() {
  const head = documentHead({
    title: "Page not found — SleekDee",
    description: "The page you were looking for has moved or does not exist.",
    canonical: `${site.baseUrl}404.html`,
    ogImage: "assets/woop/wp-a.jpg",
    level: 0,
    base: true
  });
  const main = `<section class="container error-page"><p class="code">404</p><h1>That page wandered off.</h1><p>The good work is still here. Head home or browse all seven case studies.</p><div class="button-row"><a class="btn btn-primary" href="./">Back home</a><a class="btn btn-ghost" href="work/">See the work</a></div></section>`;
  return pageShell({ level: 0, current: "home", head, main, base404: true });
}

async function write(relative, contents) {
  const destination = path.join(root, relative);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, contents, "utf8");
}

await write("index.html", homePage());
await write("work/index.html", workPage());
for (const slug of projectOrder) await write(`work/${slug}/index.html`, projectPage(slug));
await write("404.html", errorPage());
await write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}sitemap.xml\n`);
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.baseUrl}</loc><lastmod>${buildDate}</lastmod><priority>1.0</priority></url>
  <url><loc>${site.baseUrl}work/</loc><lastmod>${buildDate}</lastmod><priority>0.9</priority></url>
  ${projectOrder.map((slug) => `<url><loc>${site.baseUrl}work/${slug}/</loc><lastmod>${buildDate}</lastmod><priority>0.8</priority></url>`).join("\n  ")}
</urlset>
`);

console.log(`Built ${projectOrder.length + 3} HTML pages.`);
