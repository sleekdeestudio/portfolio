import fs from "node:fs/promises";
import path from "node:path";
import { projectOrder, projects, site, workItems } from "../data/projects.mjs";

const root = path.resolve(".");
const manifest = JSON.parse(await fs.readFile(path.join(root, "assets/manifest.json"), "utf8"));
const buildDate = new Date().toISOString().slice(0, 10);
const year = new Date().getFullYear();

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const assetPath = (source) => source === "assets/logo.png"
  ? source
  : source.replace(/\.(?:jpe?g|png|webp)$/i, ".webp");

const prefixFor = (level) => "../".repeat(level);

function image(source, alt, level, { eager = false, className = "" } = {}) {
  const optimized = assetPath(typeof source === "string" ? source : source.src);
  const metadata = manifest[optimized];
  if (!metadata) throw new Error(`No metadata found for ${optimized}`);
  return `<img src="${prefixFor(level)}${optimized}" alt="${escapeHtml(alt)}" width="${metadata.width}" height="${metadata.height}"${className ? ` class="${className}"` : ""}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

const external = (href, label, className = "") => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener"${className ? ` class="${className}"` : ""}>${label}</a>`;

const icons = {
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

function documentHead({ title, description, canonical, ogImage, level, type = "website", schema = "" }) {
  const prefix = prefixFor(level);
  const imageUrl = `${site.baseUrl}${assetPath(ogImage)}`;
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#5f060c">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${canonical}">
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
  <link rel="icon" type="image/png" href="${prefix}assets/favicon.png">
  <link rel="apple-touch-icon" href="${prefix}assets/apple-touch-icon.png">
  <link rel="manifest" href="${prefix}site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500&amp;family=Space+Grotesk:wght@300;400;500&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}styles.css?v=20260809">
  ${schema}
</head>`;
}

function pathsFor(level) {
  if (level === 0) return { home: "./", work: "work/", contact: "#contact" };
  if (level === 1) return { home: "../", work: "./", contact: "../#contact" };
  return { home: "../../", work: "../", contact: "../../#contact" };
}

function siteNav(level) {
  const paths = pathsFor(level);
  return `<nav class="site-nav deep" aria-label="Primary">
  <a class="wordmark" href="${paths.home}">Tirth Mody</a>
  <div class="nav-actions"><a class="button button-accent nav-contact" href="${paths.contact}">Let's talk</a><button class="button menu-button" type="button" aria-expanded="false" aria-controls="menu-overlay" data-menu-open>MENU</button></div>
</nav>`;
}

function menuOverlay(level, current) {
  const paths = pathsFor(level);
  const links = [
    ["01", "home", paths.home, current === "home"], ["02", "work", paths.work, current === "work"],
    ["03", "services", `${paths.home}#services`, false], ["04", "process", `${paths.home}#process`, false],
    ["05", "about", `${paths.home}#about`, false], ["06", "contact", paths.contact, false]
  ];
  return `<div class="menu-overlay deep" id="menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu" data-menu hidden>
  <div class="menu-head"><span class="wordmark">Tirth Mody</span><button class="button menu-close" type="button" data-menu-close>CLOSE <span aria-hidden="true">×</span></button></div>
  <nav class="menu-links" aria-label="Menu">${links.map(([number, label, href, active], index) => `<a class="menu-delay-${index + 1}" href="${href}"${active ? ' aria-current="page"' : ""}><span>(${number})</span>${label}</a>`).join("")}</nav>
  <div class="menu-foot"><span>(follow)</span>${external(site.socials.instagram, "Instagram")}${external(site.socials.linkedin, "LinkedIn")}${external(site.socials.behance, "Bē Behance")}${external(site.socials.portfolio, "Portfolio")}<a href="mailto:${site.email}">${site.email}</a></div>
</div>`;
}

function footer(level) {
  const paths = pathsFor(level);
  return `<footer class="site-footer deep"><div class="content"><strong>Tirth Mody</strong><span>© <span data-year>${year}</span></span><span class="footer-push">Made to be scrolled.</span><a href="${paths.home}#top">Back to top ↑</a></div></footer>`;
}

function pageShell({ level, current, head, main }) {
  return `${head}
<body id="top">
  <a class="skip-link" href="#main">Skip to content</a>
  ${siteNav(level)}
  <main id="main">${main}</main>
  ${footer(level)}
  ${menuOverlay(level, current)}
  <script src="${prefixFor(level)}site.js?v=20260809" defer></script>
</body>
</html>\n`;
}

function cardHref(item, location) {
  return location === "home" ? `work/${item.slug}/` : `${item.slug}/`;
}

function workCard(item, level, location = "work") {
  const href = cardHref(item, location);
  const mediaClass = item.layout.split(" ").map((name) => `media-${name}`).join(" ");
  return `<article class="stack-card" data-stack data-bright>
  <a href="${href}" aria-label="View ${escapeHtml(item.title)} case study">
    <figure class="card-media ${mediaClass}">${item.images.map((source, index) => image(source, item.alts[index], level, { eager: item.number === "01" && location === "home" })).join("")}</figure>
    <div class="card-copy"><span class="card-number">${item.number}</span><div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div><div class="card-tags">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div><span class="card-action">view project ${icons.arrow}</span></div>
  </a>
</article>`;
}

function homePage() {
  const description = "SleekDee is Tirth Mody's one-person creative studio for brand identity, packaging, social media, photography and content.";
  const schema = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: site.name, url: site.baseUrl, jobTitle: "Brand designer and cinematographer", email: `mailto:${site.email}`, telephone: site.phoneHref, sameAs: Object.values(site.socials) })}</script>`;
  const services = [["01", "Brand identity", "Strategic identities and systems that are unmistakable at thumbnail size."], ["02", "Social media", "Campaigns, calendars and content that give your audience a reason to stop."], ["03", "Photography & film", "Product, food and live work shot through the same point of view as the design."], ["04", "Packaging", "Tins, boxes, labels and print that make shelf space feel earned."]];
  const steps = [["01", "I uncover your story", "I dig into what makes you irreplaceable and turn it into positioning with a clear point of view.", "Strategy & positioning", "media/step1.mp4"], ["02", "I make the work", "Design, shoot, edit and shape the system so nothing gets lost between ideas and delivery.", "Design & production", "media/step2.mp4"], ["03", "We put it to work", "We launch, learn and sharpen the work until the numbers begin to move.", "Launch & growth", "media/step3.mp4"]];
  const clients = ["Marshall", "Interior Goods Direct", "Sapphire", "Ernest Jones", "Pringles"];
  const marquee = `<div class="marquee-track">${[...clients, ...clients].map((client) => `<span>${client}</span><i aria-hidden="true"></i>`).join("")}</div>`;
  const main = `
<section class="hero deep" aria-labelledby="hero-title"><div class="content hero-content">
  <p class="eyebrow">SleekDee / independent studio</p>
  <h1 id="hero-title" aria-label="I build brands that look sharp and grow online."><span data-hero-line="I build brands">I build brands</span><span data-hero-line="that look sharp" data-hero-accent="sharp">that look <em>sharp</em></span><span data-hero-line="and grow online.">and grow online.</span></h1>
  <p class="hero-copy" data-blurline>I'm Tirth Mody, the designer and cinematographer behind SleekDee. Identities, feeds, packaging and photographs that pull their weight: work that looks good and sells harder.</p>
  <div class="hero-tags"><span>designer</span><span>cinematographer</span><span>one-person studio</span></div>
  <div class="hero-actions"><a class="button button-accent" href="#contact">Let's work together</a><a class="text-link" href="#work">See the work ${icons.arrow}</a></div>
</div></section>
<section class="client-strip deep" aria-label="Brands I have grown"><div class="content"><p>Brands I've grown</p></div><div class="marquee" aria-label="Marshall, Interior Goods Direct, Sapphire, Ernest Jones and Pringles">${marquee}</div></section>
<section class="section cream" id="services" data-wipe><div class="content"><p class="eyebrow">What I do</p><div class="section-heading"><h2>Built for the moments people decide to care.</h2><p>One studio across strategy, design, content and production — all kept in the same conversation from first thought to final frame.</p></div><div class="service-list">${services.map(([number, title, copy]) => `<article class="service-row" data-svc><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div><a href="#contact" aria-label="Discuss ${title}">→</a></article>`).join("")}</div></div></section>
<section class="section work-section cream" id="work" data-wipe><div class="content"><div class="section-heading"><div><p class="eyebrow">Selected work</p><h2>Things I've made lately.</h2></div><p>Identity, campaign, content and photography — all from the same pair of hands.</p></div><div class="stack-deck">${workItems.map((item) => workCard(item, 0, "home")).join("")}</div><div class="section-action"><a class="button button-outline" href="work/">Show me more work ${icons.arrow}</a></div></div></section>
<section class="section process cream" id="process" data-wipe><div class="content"><div class="section-heading"><div><p class="eyebrow">How we'll work</p><h2>Three steps, no mystery.</h2></div><p>Strategy, design, shoot and edit. One person across all three, so nothing gets lost in between.</p></div><div class="process-track"><div class="process-rail" data-rail></div>${steps.map(([number, title, copy, caption, video], index) => `<article class="process-step" data-step data-bright data-reveal data-delay="${index * 120}"><div class="process-copy"><p><span>step</span> ${number}</p><h3>${title}</h3><p>${copy}</p></div><figure><video src="${video}" muted loop playsinline preload="metadata" data-autoplay-video></video><figcaption><span>${caption}</span><span>${number} / 03</span></figcaption></figure></article>`).join("")}</div></div></section>
<section class="section about deep" id="about"><div class="content about-layout"><figure class="portrait">${image("assets/portrait.webp", "Portrait of Tirth Mody", 0)}</figure><div><p class="eyebrow">The person behind it</p><h2>Hi, I'm Tirth.</h2><p data-words>SleekDee is my one-person studio. I make brands and images that have something to say, then build the systems that keep them saying it.</p><p>Based in the UK, working with ambitious small businesses everywhere.</p><div class="profile-links">${external(site.socials.portfolio, "Portfolio", "button button-accent")}${external(site.socials.behance, "Bē Behance", "text-link")}${external(site.socials.linkedin, "LinkedIn", "text-link")}${external(site.socials.instagram, "Instagram", "text-link")}</div></div></div></section>
<section class="section testimonials deep"><div class="content"><p class="eyebrow">Kind words</p><h2>What clients say after.</h2><div class="testimonial-grid"><figure data-reveal><blockquote>“Tirth took our feed from posting when we remember to a machine. Enquiries doubled in three months — and it still looks like us.”</blockquote><figcaption>Marshall <span>Social media marketing</span></figcaption></figure><figure data-reveal data-delay="120"><blockquote>“The feed redesign paid for itself. One cohesive grid, and suddenly we look like the premium brand we always were.”</blockquote><figcaption>Interior Goods Direct <span>Feed redesign</span></figcaption></figure></div></div></section>
<section class="section contact deep" id="contact"><div class="content"><div class="contact-panel"><div><p class="eyebrow">Let's cross paths</p><h2>Impressed? Let's make something hard to scroll past.</h2><p>Tell me what you're building and I'll reply within a day — usually faster. No decks, no account managers, just me.</p></div><div class="contact-actions"><a href="mailto:${site.email}">${icons.email}${site.email}</a><a href="tel:${site.phoneHref}">${icons.phone}${site.phone}</a><a class="button button-accent" href="mailto:${site.email}?subject=New%20project%20for%20SleekDee">Start a conversation ${icons.arrow}</a></div></div></div></section>`;
  return pageShell({ level: 0, current: "home", head: documentHead({ title: "Tirth Mody — Brand designer & cinematographer | SleekDee", description, canonical: site.baseUrl, ogImage: "assets/prakriti/pk-hero.png", level: 0, schema }), main });
}

function workPage() {
  const description = "Explore eight SleekDee case studies spanning brand identity, packaging, social content, campaign design and photography.";
  const main = `<section class="page-hero deep"><div class="content"><p class="eyebrow">Selected work</p><h1>Work that earns attention — and keeps it.</h1><p>Eight case studies across identity, packaging, campaigns and content — designed, photographed and delivered by one pair of hands.</p></div></section><section class="section work-section cream"><div class="content"><div class="stack-deck">${workItems.map((item) => workCard(item, 1)).join("")}</div></div></section><section class="section deep"><div class="content work-cta"><h2>Your brand could be next. Let's make it impossible to scroll past.</h2><a class="button button-accent" href="../#contact">Start a project ${icons.arrow}</a></div></section>`;
  return pageShell({ level: 1, current: "work", head: documentHead({ title: "Selected work — Tirth Mody | SleekDee", description, canonical: `${site.baseUrl}work/`, ogImage: "assets/prakriti/pk-hero.png", level: 1 }), main });
}

function ratioClass(ratio) {
  if (ratio === "1 / 1") return "ratio-square";
  if (ratio === "3 / 4") return "ratio-three-four";
  if (ratio === "5221 / 8108") return "ratio-prakriti";
  return "ratio-four-five";
}

function renderGallery(project, level) {
  let currentSection = "project";
  let visualIndex = 0;
  return project.blocks.map((block) => {
    if (block.type === "section") {
      currentSection = block.title;
      return `<header class="gallery-section"><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.note)}</p><span>${escapeHtml(block.count)}</span></header>`;
    }
    if (block.type === "image" || block.type === "bare") {
      visualIndex += 1;
      return `<figure class="gallery-image${block.type === "bare" ? " gallery-bare" : ""}">${image(block.src, `${project.title} — ${currentSection} visual ${visualIndex}`, level)}</figure>`;
    }
    if (block.type === "row") {
      return `<div class="gallery-row cols-${block.columns} ${ratioClass(block.ratio)}">${block.sources.map((source) => {
        visualIndex += 1;
        const sourcePath = typeof source === "string" ? source : source.src;
        const zoom = typeof source === "string" ? "" : ` zoom-${Math.round((source.zoom || 1) * 100)}`;
        return `<figure class="gallery-image${zoom}">${image(sourcePath, `${project.title} — ${currentSection} visual ${visualIndex}`, level)}</figure>`;
      }).join("")}</div>`;
    }
    throw new Error(`Unknown gallery block: ${block.type}`);
  }).join("");
}

function projectPage(slug) {
  const project = projects[slug];
  const index = projectOrder.indexOf(slug);
  const previous = projects[projectOrder[(index - 1 + projectOrder.length) % projectOrder.length]];
  const next = projects[projectOrder[(index + 1) % projectOrder.length]];
  const previousSlug = projectOrder[(index - 1 + projectOrder.length) % projectOrder.length];
  const nextSlug = projectOrder[(index + 1) % projectOrder.length];
  const description = project.summary[0].length > 155 ? `${project.summary[0].slice(0, 152).trimEnd()}…` : project.summary[0];
  const canonical = `${site.baseUrl}work/${slug}/`;
  const schema = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, creator: { "@type": "Person", name: site.name, url: site.baseUrl }, description, url: canonical, image: `${site.baseUrl}${assetPath(project.og)}` })}</script>`;
  const main = `<article><header class="project-hero deep"><div class="content project-content"><a class="back-link" href="../">← all work</a><p>${project.number}</p><h1>${escapeHtml(project.title)}</h1><span>${escapeHtml(project.meta)}</span></div></header><section class="project-details cream"><div class="content project-content"><div><p class="detail-label">(project summary)</p>${project.summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div><div><p class="detail-label">(project segments)</p>${project.segments.map((segment) => `<p class="detail-item">${escapeHtml(segment)}</p>`).join("")}</div><div><p class="detail-label">(niche)</p><p class="detail-item">${escapeHtml(project.niche)}</p></div></div></section><section class="project-gallery cream"><div class="content project-content">${renderGallery(project, 2)}</div></section><footer class="project-footer cream"><div class="content project-content"><nav aria-label="Adjacent case studies"><a href="../${previousSlug}/">← ${escapeHtml(previous.title)}</a><a href="../${nextSlug}/">${escapeHtml(next.title)} →</a></nav><a class="button button-accent" href="../../#contact">Want yours next? Let's talk</a></div></footer></article>`;
  return pageShell({ level: 2, current: "project", head: documentHead({ title: `${project.title} — Case study | SleekDee`, description, canonical, ogImage: project.og, level: 2, type: "article", schema }), main });
}

function errorPage() {
  const main = `<section class="error-page deep"><div class="content"><p>404</p><h1>That page wandered off.</h1><span>The good work is still here. Head home or browse the case studies.</span><div><a class="button button-accent" href="./">Back home</a><a class="button button-outline" href="work/">See the work</a></div></div></section>`;
  return pageShell({ level: 0, current: "home", head: documentHead({ title: "Page not found — SleekDee", description: "The page you were looking for has moved or does not exist.", canonical: `${site.baseUrl}404.html`, ogImage: "assets/prakriti/pk-hero.png", level: 0 }), main });
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
await write("CNAME", "tirthmody.space\n");
await write("site.webmanifest", `${JSON.stringify({ name: "SleekDee — Tirth Mody", short_name: "SleekDee", start_url: "/", display: "standalone", background_color: "#5f060c", theme_color: "#5f060c", icons: [{ src: "assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] }, null, 2)}\n`);
await write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}sitemap.xml\n`);
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.baseUrl}</loc><lastmod>${buildDate}</lastmod><priority>1.0</priority></url>
  <url><loc>${site.baseUrl}work/</loc><lastmod>${buildDate}</lastmod><priority>0.9</priority></url>
  ${projectOrder.map((slug) => `<url><loc>${site.baseUrl}work/${slug}/</loc><lastmod>${buildDate}</lastmod><priority>0.8</priority></url>`).join("\n  ")}
</urlset>
`);

console.log(`Built ${projectOrder.length + 3} HTML pages for ${site.baseUrl}.`);
