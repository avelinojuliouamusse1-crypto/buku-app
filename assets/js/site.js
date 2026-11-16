/* =========================================================
   BUKU Autores — site script (sem dependências)
   ========================================================= */
(function () {
  "use strict";

  const ROOT = document.documentElement.dataset.root || "";
  const PAGE = document.body.dataset.page || "";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (p) => (/^(https?:)?\/\//.test(p) || !p ? p : ROOT + p);
  const store = {
    get(k, s = localStorage) { try { return JSON.parse(s.getItem(k)); } catch (e) { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Conteúdos (JSON editáveis no painel) ---------- */
  const cache = {};
  // Lê content/*.json; se não for possível (ex.: ficheiro aberto sem servidor),
  // usa a cópia embutida em assets/js/content-data.js.
  function load(name) {
    if (!cache[name]) {
      const embedded = () => (window.BUKU_CONTENT && window.BUKU_CONTENT[name]) || {};
      cache[name] = location.protocol === "file:"
        ? Promise.resolve(embedded())
        : fetch(ROOT + "content/" + name + ".json", { cache: "no-cache" })
            .then((r) => (r.ok ? r.json() : embedded()))
            .catch(embedded);
    }
    return cache[name];
  }

  const CATEGORIAS = {
    biografias: "Biografias",
    autobiografias: "Autobiografias",
    cientificos: "Livros científicos",
    educativos: "Livros educativos",
    religiosos: "Livros religiosos",
    institucionais: "Projectos institucionais"
  };

  /* ---------- Ícones ---------- */
  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-4.1-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6 6 6 0 0 0 1.3 3.2 13.8 13.8 0 0 0 5.3 4.7c2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2-1.5a2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.9 18L.2 24l6.2-1.6A11.8 11.8 0 1 0 12 .2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a6 6 0 1 0 5.1 5.9V9a7.6 7.6 0 0 0 4.5 1.4V7.1a4.3 4.3 0 0 1-3.4-1.3z"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.7 4.8 6.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
  };

  /* ---------- Rastreio de origem (UTM) ---------- */
  function captureUtm() {
    const q = new URLSearchParams(location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    const found = {};
    keys.forEach((k) => { if (q.get(k)) found[k] = q.get(k); });
    const ss = sessionStorage;
    if (Object.keys(found).length) {
      store.set("buku_utm", Object.assign({}, found, { landing: location.pathname, referrer: document.referrer || "" }), ss);
    } else if (!store.get("buku_utm", ss)) {
      store.set("buku_utm", { landing: location.pathname, referrer: document.referrer || "" }, ss);
    }
    if (document.body.dataset.campanha) {
      const u = store.get("buku_utm", ss) || {};
      u.campanha_pagina = document.body.dataset.campanha;
      store.set("buku_utm", u, ss);
    }
  }
  const utm = () => store.get("buku_utm", sessionStorage) || {};

  /* ---------- WhatsApp ---------- */
  function waLink(cfg, text) {
    const u = utm();
    let msg = text || cfg.whatsapp_mensagem || "Olá BUKU!";
    if (u.utm_source && !text) msg += " (via " + u.utm_source + ")";
    return "https://wa.me/" + String(cfg.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
  }

  /* ---------- Cabeçalho e rodapé ---------- */
  const NAV = [
    ["index.html", "Início", "home"],
    ["servicos.html", "Serviços", "servicos"],
    ["portfolio.html", "Portfólio", "portfolio"],
    ["como-funciona.html", "Como funciona", "processo"],
    ["sobre.html", "Sobre", "sobre"],
    ["blog.html", "Blog", "blog"],
    ["contactos.html", "Contactos", "contactos"]
  ];
  const logo = (light) => `<a class="logo${light ? " logo--light" : ""}" href="${ROOT}index.html" aria-label="BUKU Autores — início"><span class="logo__word">BUKU</span><span class="logo__sub">Autores</span></a>`;

  function renderHeader() {
    const el = $("#site-header");
    if (!el) return;
    const section = document.body.dataset.nav || PAGE;
    el.className = "site-header";
    el.innerHTML = `
      <div class="wrap nav">
        ${logo()}
        <nav aria-label="Navegação principal">
          <ul class="nav__links" id="nav-links">
            ${NAV.map(([h, t, k]) => `<li><a href="${ROOT}${h}"${k === section ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}
            <li class="nav__mobile-cta"><a class="btn btn--primary" href="${ROOT}contactos.html">Quero criar o meu livro</a></li>
          </ul>
        </nav>
        <div class="nav__cta">
          <a class="btn btn--primary btn--sm" href="${ROOT}contactos.html">Pedir proposta</a>
          <button class="nav__toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
        </div>
      </div>`;
    const t = $(".nav__toggle", el);
    t.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      t.setAttribute("aria-expanded", open);
      t.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    $$(".nav__links a", el).forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
    const onScroll = () => el.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function socialLinks(cfg, dark) {
    const items = [["instagram", "Instagram", ICON.ig], ["facebook", "Facebook", ICON.fb], ["tiktok", "TikTok", ICON.tt], ["linkedin", "LinkedIn", ICON.in]]
      .filter(([k]) => cfg[k]);
    return `<div class="social${dark ? " social--dark" : ""}">${items.map(([k, n, i]) => `<a href="${esc(cfg[k])}" target="_blank" rel="noopener" aria-label="${n}">${i}</a>`).join("")}</div>`;
  }

  function renderFooter(cfg) {
    const el = $("#site-footer");
    if (!el) return;
    el.className = "site-footer";
    const y = new Date().getFullYear();
    el.innerHTML = `
      <div class="wrap">
        <div class="footer__top">
          <div class="footer__brand">
            ${logo(true)}
            <p>Transformamos histórias, experiências e conhecimentos em livros que deixam marca.</p>
            ${socialLinks(cfg)}
          </div>
          <div>
            <h4>Serviços</h4>
            <ul>
              <li><a href="${ROOT}servicos.html#biografias">Biografias</a></li>
              <li><a href="${ROOT}servicos.html#profissionais">Livros profissionais</a></li>
              <li><a href="${ROOT}servicos.html#educativos">Educativos e religiosos</a></li>
              <li><a href="${ROOT}servicos.html#manuscritos">Manuscritos</a></li>
              <li><a href="${ROOT}servicos.html#institucional">Institucional</a></li>
            </ul>
          </div>
          <div>
            <h4>BUKU</h4>
            <ul>
              <li><a href="${ROOT}sobre.html">Sobre nós</a></li>
              <li><a href="${ROOT}portfolio.html">Portfólio</a></li>
              <li><a href="${ROOT}como-funciona.html">Como funciona</a></li>
              <li><a href="${ROOT}blog.html">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4>Para si</h4>
            <ul>
              <li><a href="${ROOT}lp/medicos.html">Médicos</a></li>
              <li><a href="${ROOT}lp/professores.html">Professores</a></li>
              <li><a href="${ROOT}lp/lideres-religiosos.html">Líderes religiosos</a></li>
              <li><a href="${ROOT}lp/biografias.html">Biografias</a></li>
            </ul>
          </div>
          <div class="footer__news">
            <h4>Guia gratuito</h4>
            <p style="margin:0 0 1rem">Receba o guia “Da ideia ao livro” e conteúdos sobre escrita e publicação.</p>
            <form class="form--inline" data-buku-form="newsletter" name="newsletter" method="POST" data-netlify="true" netlify-honeypot="empresa_site" novalidate>
              <input type="hidden" name="form-name" value="newsletter">
              <input class="hp" name="empresa_site" tabindex="-1" autocomplete="off" aria-hidden="true">
              <label class="sr-only" for="nl-email">Email</label>
              <input id="nl-email" type="email" name="email" placeholder="O seu email" required>
              <button class="btn btn--primary btn--sm" type="submit">Receber</button>
              <div class="form__status" role="status" style="grid-column:auto;margin-top:8px;color:var(--ink)"></div>
            </form>
            <p style="margin:1.4rem 0 0;line-height:1.7">${esc(cfg.telefone || "")}<br><a href="mailto:${esc(cfg.email || "")}">${esc(cfg.email || "")}</a><br>${esc(cfg.morada || "")}</p>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${y} BUKU Autores. Todos os direitos reservados.</span>
          <span><a href="${ROOT}privacidade.html">Privacidade</a> · <button type="button" data-open-consent>Preferências de cookies</button></span>
        </div>
      </div>`;
  }

  function renderWhatsApp(cfg) {
    if (!cfg.whatsapp) return;
    const a = document.createElement("a");
    a.className = "wa-float";
    a.href = waLink(cfg);
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Falar connosco no WhatsApp");
    a.innerHTML = ICON.wa + "<span>Fale connosco</span>";
    a.addEventListener("click", () => track("whatsapp_click"));
    document.body.appendChild(a);
    $$("[data-wa]").forEach((el) => {
      el.href = waLink(cfg, el.dataset.wa || undefined);
      el.target = "_blank";
      el.rel = "noopener";
      el.addEventListener("click", () => track("whatsapp_click"));
    });
  }

  /* ---------- Consentimento + Analytics / Pixel ---------- */
  function track(event, params) {
    if (window.gtag) window.gtag("event", event, params || {});
    if (window.fbq) {
      if (event === "generate_lead") window.fbq("track", "Lead", params || {});
      else if (event === "whatsapp_click") window.fbq("track", "Contact");
    }
  }

  function loadTrackers(cfg) {
    if (cfg.ga4_id && !window.gtag) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4_id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.ga4_id);
    }
    if (cfg.meta_pixel_id && !window.fbq) {
      /* Meta Pixel base code */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", cfg.meta_pixel_id);
      window.fbq("track", "PageView");
    }
  }

  function initConsent(cfg) {
    const box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Preferências de cookies");
    box.innerHTML = `
      <h4>A sua privacidade</h4>
      <p>Usamos cookies essenciais para o site funcionar. Com a sua autorização, usamos também cookies de estatística e marketing (Google Analytics e Meta Pixel) para melhorar a comunicação. <a href="${ROOT}privacidade.html">Saber mais</a>.</p>
      <div class="btn-row">
        <button class="btn btn--primary btn--sm" data-c="all">Aceitar todos</button>
        <button class="btn btn--ghost btn--sm" data-c="essential">Apenas essenciais</button>
      </div>`;
    document.body.appendChild(box);
    const choice = store.get("buku_consent");
    const apply = (c) => {
      if (c === "all") { loadTrackers(cfg); loadInstagram(cfg); }
    };
    if (!choice) box.classList.add("is-open"); else apply(choice);
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]");
      if (!b) return;
      store.set("buku_consent", b.dataset.c);
      box.classList.remove("is-open");
      apply(b.dataset.c);
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-consent]")) box.classList.add("is-open");
    });
  }

  /* ---------- Instagram (embeds só com consentimento) ---------- */
  function loadInstagram(cfg) {
    const el = $("#ig-feed");
    if (!el || !(cfg.instagram_posts || []).length) return;
    el.innerHTML = cfg.instagram_posts.map((p) => `<blockquote class="instagram-media" data-instgrm-permalink="${esc(p)}" data-instgrm-version="14" style="margin:0;max-width:540px;width:100%"></blockquote>`).join("");
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(s);
  }

  /* ---------- Animações discretas ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((e) => io.observe(e));
  }

  function initTimeline() {
    const tl = $(".timeline");
    if (!tl) return;
    const fill = document.createElement("span");
    fill.className = "timeline__fill";
    tl.prepend(fill);
    const items = $$(":scope > li", tl);
    const update = () => {
      const r = tl.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const h = Math.max(0, Math.min(r.height, mid - r.top));
      fill.style.height = h + "px";
      items.forEach((li) => li.classList.toggle("is-active", li.getBoundingClientRect().top < mid));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initSvcNav() {
    const links = $$(".svc-nav__list a");
    if (!links.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".svc").forEach((s) => io.observe(s));
  }

  /* ---------- Mockup de livro ---------- */
  function book(o) {
    const style = o.style || "red";
    const bg = o.image ? ` style="background-image:url('${esc(url(o.image))}')"` : "";
    return `<div class="book book--${style}${o.image ? " book--photo" : ""}${o.cls ? " " + o.cls : ""}" role="img" aria-label="${esc(o.label || o.title || "Livro")}">
      <div class="book__inner"><div class="book__pages"></div>
        <div class="book__cover"${bg}>
          <div class="book__brand">BUKU<small>Autores</small></div>
          <div><div class="book__line"></div><p class="book__title">${o.title || ""}</p></div>
          <div class="book__author">${esc(o.author || "")}</div>
        </div>
      </div>
    </div>`;
  }
  window.BUKU_book = book;

  /* ---------- Portfólio ---------- */
  const showDemo = new URLSearchParams(location.search).get("modelo") === "1";
  async function getObras() {
    const d = await load("obras");
    return (d.obras || []).filter((o) => o.publicado !== false && (!o.demo || showDemo));
  }

  function obraCard(o) {
    const cover = o.capa
      ? `<img src="${esc(url(o.capa))}" alt="Capa de ${esc(o.titulo)}" loading="lazy" style="box-shadow:var(--shadow)">`
      : book({ style: o.capa_estilo, title: esc(o.titulo), author: o.autor_autorizado ? o.autor : "" });
    return `<a class="shelf__item reveal" href="${ROOT}obra.html?id=${encodeURIComponent(o.id)}" data-cat="${esc(o.categoria)}">
      <div class="shelf__stage">${o.demo ? '<span class="shelf__status">Modelo</span>' : ""}${cover}</div>
      <span class="shelf__cat">${esc(CATEGORIAS[o.categoria] || o.categoria)}</span>
      <h3>${esc(o.titulo)}</h3>
      <p>${o.autor_autorizado && o.autor ? esc(o.autor) : esc(o.subtitulo || "")}</p>
    </a>`;
  }

  async function renderPortfolio() {
    const grid = $("#portfolio-grid");
    if (!grid) return;
    const obras = await getObras();
    const filters = $("#portfolio-filters");
    const counts = {};
    obras.forEach((o) => { counts[o.categoria] = (counts[o.categoria] || 0) + 1; });
    filters.innerHTML = `<button class="filter is-active" data-f="*">Todas<sup>${obras.length}</sup></button>` +
      Object.entries(CATEGORIAS).map(([k, v]) => `<button class="filter" data-f="${k}">${v}${counts[k] ? `<sup>${counts[k]}</sup>` : ""}</button>`).join("");
    const draw = (f) => {
      const list = obras.filter((o) => f === "*" || o.categoria === f);
      grid.innerHTML = list.length
        ? list.map(obraCard).join("")
        : `<div class="portfolio-empty"><p><strong>As primeiras obras estão em produção.</strong></p><p>Esta galeria será actualizada com projectos reais, publicados com autorização dos autores.</p><a class="btn btn--primary btn--sm" href="${ROOT}contactos.html">Seja um dos primeiros autores</a></div>`;
      initReveal();
    };
    const initial = new URLSearchParams(location.search).get("categoria") || "*";
    draw(initial);
    $$(".filter", filters).forEach((b) => b.classList.toggle("is-active", b.dataset.f === initial));
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".filter");
      if (!b) return;
      $$(".filter", filters).forEach((x) => x.classList.toggle("is-active", x === b));
      draw(b.dataset.f);
    });
  }

  async function renderFeatured() {
    const el = $("#featured-works");
    if (!el) return;
    const obras = (await getObras()).filter((o) => !o.demo).slice(0, 3);
    if (obras.length) {
      el.innerHTML = obras.map(obraCard).join("");
      initReveal();
    }
    /* sem obras reais: mantém-se o bloco do programa Autores Fundadores já presente no HTML */
  }

  async function renderObra() {
    const el = $("#obra");
    if (!el) return;
    const id = new URLSearchParams(location.search).get("id");
    const d = await load("obras");
    const o = (d.obras || []).find((x) => x.id === id && x.publicado !== false);
    if (!o) {
      el.innerHTML = `<div class="wrap section center"><h1>Obra não encontrada</h1><p class="muted">Esta obra pode ainda não estar publicada.</p><a class="btn btn--primary" href="${ROOT}portfolio.html">Voltar ao portfólio</a></div>`;
      return;
    }
    document.title = o.titulo + " — Portfólio BUKU Autores";
    const meta = $('meta[name="description"]');
    if (meta) meta.content = o.resumo || "";
    const cover = o.capa
      ? `<img src="${esc(url(o.capa))}" alt="Capa de ${esc(o.titulo)}">`
      : book({ style: o.capa_estilo, title: esc(o.titulo), author: o.autor_autorizado ? o.autor : "" });
    const facts = [["Categoria", CATEGORIAS[o.categoria] || o.categoria], ["Ano", o.ano], ["Páginas", o.paginas], ["Formato", o.formato]].filter((f) => f[1]);
    const imgs = [].concat(o.fotografias || [], o.paginas_interiores || []);
    const gal = (arr, label) => arr.length ? `<h2 class="mt-2">${label}</h2><div class="gallery">${arr.map((src) => `<button type="button" data-lightbox="${esc(url(src))}"><img src="${esc(url(src))}" alt="${label} — ${esc(o.titulo)}" loading="lazy"></button>`).join("")}</div>` : "";
    el.innerHTML = `
      <div class="wrap">
        <div class="obra-hero">
          <div class="obra-hero__stage reveal">${cover}</div>
          <div class="reveal reveal-d1">
            <p class="crumbs"><a href="${ROOT}portfolio.html">Portfólio</a> / ${esc(CATEGORIAS[o.categoria] || "")}</p>
            <h1 style="font-size:clamp(2rem,4vw,3.4rem)">${esc(o.titulo)}</h1>
            ${o.subtitulo ? `<p class="lead">${esc(o.subtitulo)}</p>` : ""}
            ${o.autor_autorizado && o.autor ? `<p><strong>${esc(o.autor)}</strong></p>` : ""}
            ${o.demo ? `<p class="demo-flag">Ficha-modelo de demonstração. Substitua por uma obra real no painel administrativo.</p>` : ""}
            <dl class="obra-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
            <p>${esc(o.resumo)}</p>
            ${(o.servicos || []).length ? `<h4 class="eyebrow mt-2">Serviços executados</h4><ul class="chips">${o.servicos.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
          </div>
        </div>
      </div>
      ${o.caso_problema || o.caso_processo || o.caso_resultado ? `
      <section class="section section--soft"><div class="wrap">
        <div class="section-head"><span class="eyebrow">Estudo de caso</span><h2>Como esta obra nasceu</h2></div>
        <div class="case">
          <div><h3>O desafio</h3><p>${esc(o.caso_problema)}</p></div>
          <div><h3>O processo</h3><p>${esc(o.caso_processo)}</p></div>
          <div><h3>O resultado</h3><p>${esc(o.caso_resultado)}</p></div>
        </div>
      </div></section>` : ""}
      <section class="section"><div class="wrap">
        ${o.video ? `<h2>Vídeo</h2>${videoEmbed(o.video, o.titulo)}` : ""}
        ${gal(o.fotografias || [], "Fotografias do livro")}
        ${gal(o.paginas_interiores || [], "Páginas interiores")}
        ${o.testemunho && o.testemunho_autorizado ? `<figure class="quote mt-2" style="max-width:760px"><blockquote>“${esc(o.testemunho)}”</blockquote><figcaption><strong>${esc(o.autor)}</strong>Autor(a)</figcaption></figure>` : ""}
      </div></section>`;
    initReveal();
    initLightbox(imgs.map(url));
    initVideos();
  }

  /* ---------- Vídeo (carrega só ao clicar) ---------- */
  function ytId(u) { const m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; }
  function videoEmbed(u, title) {
    const id = ytId(u);
    if (!id) return `<div class="video"><video src="${esc(url(u))}" controls style="width:100%;height:100%"></video></div>`;
    return `<div class="video" data-yt="${id}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${esc(title || "Vídeo")}" loading="lazy"><button type="button" aria-label="Reproduzir vídeo">${ICON.play}</button></div>`;
  }
  function initVideos() {
    $$(".video[data-yt]").forEach((v) => {
      v.querySelector("button").addEventListener("click", () => {
        v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Vídeo"></iframe>`;
      }, { once: true });
    });
  }
  window.BUKU_video = videoEmbed;

  /* ---------- Lightbox ---------- */
  function initLightbox(list) {
    if (!list.length) return;
    let lb = $(".lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML = `<button class="lightbox__close" aria-label="Fechar">×</button><button class="lightbox__nav lightbox__nav--prev" aria-label="Anterior">‹</button><img alt=""><button class="lightbox__nav lightbox__nav--next" aria-label="Seguinte">›</button>`;
      document.body.appendChild(lb);
    }
    let i = 0;
    const img = $("img", lb);
    const show = (n) => { i = (n + list.length) % list.length; img.src = list[i]; };
    const close = () => lb.classList.remove("is-open");
    $$("[data-lightbox]").forEach((b) => b.addEventListener("click", () => { show(list.indexOf(b.dataset.lightbox)); lb.classList.add("is-open"); }));
    $(".lightbox__close", lb).onclick = close;
    $(".lightbox__nav--prev", lb).onclick = () => show(i - 1);
    $(".lightbox__nav--next", lb).onclick = () => show(i + 1);
    lb.onclick = (e) => { if (e.target === lb) close(); };
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  /* ---------- Testemunhos ---------- */
  async function renderTestimonials() {
    const el = $("#testimonials");
    if (!el) return;
    const d = await load("testemunhos");
    const list = (d.testemunhos || []).filter((t) => t.autorizado && t.publicado !== false);
    if (!list.length) return; /* mantém a nota honesta do HTML */
    el.innerHTML = `<div class="quotes">${list.map((t) => `
      <figure class="quote reveal"><blockquote>“${esc(t.texto)}”</blockquote>
      <figcaption><strong>${esc(t.nome)}</strong>${esc(t.funcao || "")}${t.obra ? " · " + esc(t.obra) : ""}${t.nota ? `<br><small>${esc(t.nota)}</small>` : ""}</figcaption></figure>`).join("")}</div>`;
    initReveal();
  }

  /* ---------- Blog ---------- */
  function md(src) {
    const inline = (s) => esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    const out = [];
    let list = null;
    const flush = () => { if (list) { out.push(`<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.t}>`); list = null; } };
    String(src || "").split(/\n{2,}/).forEach((block) => {
      block.split("\n").forEach((line) => {
        let m;
        if ((m = line.match(/^\s*[-*]\s+(.*)/))) { if (!list || list.t !== "ul") { flush(); list = { t: "ul", items: [] }; } list.items.push(m[1]); return; }
        if ((m = line.match(/^\s*\d+\.\s+(.*)/))) { if (!list || list.t !== "ol") { flush(); list = { t: "ol", items: [] }; } list.items.push(m[1]); return; }
        flush();
        if ((m = line.match(/^(#{2,3})\s+(.*)/))) out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
        else if ((m = line.match(/^>\s?(.*)/))) out.push(`<blockquote>${inline(m[1])}</blockquote>`);
        else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
      });
      flush();
    });
    return out.join("\n");
  }
  const fmtDate = (d) => { try { return new Date(d + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; } };

  async function getArtigos() {
    const d = await load("artigos");
    return (d.artigos || []).filter((a) => a.publicado !== false).sort((a, b) => String(b.data).localeCompare(String(a.data)));
  }
  const postCard = (a, featured) => `
    <a class="post reveal${featured ? " post--featured" : ""}" href="${ROOT}artigo.html?id=${encodeURIComponent(a.id)}" data-cat="${esc(a.categoria)}">
      <div class="post__img"><img src="${esc(url(a.imagem))}" alt="" loading="lazy"></div>
      <div><div class="post__meta"><b>${esc(a.categoria)}</b><span>${fmtDate(a.data)}</span>${a.leitura ? `<span>${esc(a.leitura)}</span>` : ""}</div>
      <h3>${esc(a.titulo)}</h3><p>${esc(a.resumo)}</p></div>
    </a>`;

  async function renderBlog() {
    const grid = $("#blog-grid");
    if (!grid) return;
    const arts = await getArtigos();
    const cats = ["Biografias", "Escrita de livros", "Publicação", "Conhecimento profissional", "Histórias institucionais"];
    const filters = $("#blog-filters");
    if (filters) {
      filters.innerHTML = `<button class="filter is-active" data-f="*">Todos</button>` + cats.map((c) => `<button class="filter" data-f="${c}">${c}</button>`).join("");
      filters.addEventListener("click", (e) => {
        const b = e.target.closest(".filter");
        if (!b) return;
        $$(".filter", filters).forEach((x) => x.classList.toggle("is-active", x === b));
        draw(b.dataset.f);
      });
    }
    const draw = (f) => {
      const list = arts.filter((a) => f === "*" || a.categoria === f);
      grid.innerHTML = list.length ? list.map((a, i) => postCard(a, f === "*" && i === 0 && !grid.dataset.compact)).join("") : `<div class="portfolio-empty">Ainda não há artigos nesta categoria.</div>`;
      initReveal();
    };
    if (grid.dataset.limit) { grid.dataset.compact = "1"; grid.innerHTML = arts.slice(0, +grid.dataset.limit).map((a) => postCard(a)).join(""); initReveal(); return; }
    draw("*");
  }

  async function renderArtigo() {
    const el = $("#artigo");
    if (!el) return;
    const id = new URLSearchParams(location.search).get("id");
    const arts = await getArtigos();
    const a = arts.find((x) => x.id === id);
    if (!a) { el.innerHTML = `<div class="wrap section center"><h1>Artigo não encontrado</h1><a class="btn btn--primary" href="${ROOT}blog.html">Ver todos os artigos</a></div>`; return; }
    document.title = a.titulo + " — Blog BUKU Autores";
    const meta = $('meta[name="description"]');
    if (meta) meta.content = a.resumo || "";
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: a.titulo, description: a.resumo, datePublished: a.data, image: new URL(url(a.imagem), location.href).href, author: { "@type": "Organization", name: "BUKU Autores" }, publisher: { "@type": "Organization", name: "BUKU Autores" } });
    document.head.appendChild(ld);
    const others = arts.filter((x) => x.id !== a.id).slice(0, 3);
    el.innerHTML = `
      <article class="wrap section" style="padding-bottom:40px">
        <div class="article">
          <p class="crumbs"><a href="${ROOT}blog.html">Blog</a> / ${esc(a.categoria)}</p>
          <div class="post__meta"><b>${esc(a.categoria)}</b><span>${fmtDate(a.data)}</span>${a.leitura ? `<span>${esc(a.leitura)} de leitura</span>` : ""}</div>
          <h1 style="font-size:clamp(2rem,4.4vw,3.2rem)">${esc(a.titulo)}</h1>
          <p class="lead">${esc(a.resumo)}</p>
        </div>
        <img class="article__cover" src="${esc(url(a.imagem))}" alt="" style="max-width:1000px;margin-left:auto;margin-right:auto">
        <div class="article prose">${md(a.corpo)}</div>
        <div class="article" style="margin-top:3rem;padding:2rem;background:var(--bg-soft)">
          <h3 style="margin-top:0">Tem uma história ou conhecimento para publicar?</h3>
          <p class="muted">Fale connosco. A primeira conversa é sem compromisso.</p>
          <a class="btn btn--primary" href="${ROOT}contactos.html">Solicitar avaliação inicial ${ICON.arrow}</a>
        </div>
      </article>
      ${others.length ? `<section class="section section--soft"><div class="wrap"><div class="section-head"><h2>Continue a ler</h2></div><div class="posts">${others.map((o) => postCard(o)).join("")}</div></div></section>` : ""}`;
    initReveal();
  }

  /* ---------- Avaliação inicial (quiz) ---------- */
  function initQuiz() {
    const el = $("#quiz");
    if (!el) return;
    const Q = [
      { k: "perfil", q: "Quem é o autor?", o: ["Médico(a) ou profissional de saúde", "Professor(a) ou académico(a)", "Líder religioso(a)", "Empresário(a) ou instituição", "Outro perfil"] },
      { k: "material", q: "O que já tem?", o: ["Um manuscrito completo ou quase", "Notas, textos soltos ou apresentações", "Apenas a experiência e as ideias"] },
      { k: "objectivo", q: "Qual é o principal objectivo do livro?", o: ["Contar uma história de vida", "Partilhar conhecimento profissional", "Ensinar, formar ou inspirar", "Documentar a história de uma organização"] }
    ];
    const a = {};
    let step = 0;
    const bar = $(".quiz__progress span", el);
    const body = $(".quiz__body", el);
    const result = () => {
      let svc = "Livros científicos e profissionais", tipo = "profissionais";
      if (a.objectivo === Q[2].o[0]) { svc = "Biografias e autobiografias"; tipo = "biografias"; }
      if (a.objectivo === Q[2].o[2]) { svc = "Livros educativos e religiosos"; tipo = "educativos"; }
      if (a.objectivo === Q[2].o[3] || a.perfil === Q[0].o[3]) { svc = "Documentação institucional e empresarial"; tipo = "institucional"; }
      let mod, passos;
      if (a.material === Q[1].o[0]) { mod = "Modalidade A — Aperfeiçoamento do manuscrito"; passos = "Diagnóstico do texto, reorganização, revisão, paginação e capa."; if (tipo !== "institucional") { svc = "Edição e aperfeiçoamento de manuscritos"; tipo = "manuscritos"; } }
      else if (a.material === Q[1].o[1]) { mod = "Modalidade B — Livro desenvolvido pela BUKU (a partir dos seus materiais)"; passos = "Análise dos materiais, entrevistas complementares, redacção e validação consigo."; }
      else { mod = "Modalidade B — Livro desenvolvido pela BUKU"; passos = "Entrevistas orientadas, estruturação dos capítulos, redacção e validação consigo."; }
      const nota = `Perfil: ${a.perfil} | Material: ${a.material} | Objectivo: ${a.objectivo}`;
      bar.style.width = "100%";
      body.innerHTML = `<div class="quiz__result">
        <span class="eyebrow">A nossa sugestão</span>
        <h3>${svc}</h3>
        <dl><dt>Modalidade</dt><dd>${mod}</dd><dt>Próximos passos</dt><dd>${passos}</dd><dt>Primeiro passo</dt><dd>Conversa inicial gratuita para definir tema, leitor e calendário.</dd></dl>
        <div class="btn-row"><a class="btn btn--primary" href="${ROOT}contactos.html?tipo=${tipo}&nota=${encodeURIComponent(nota)}">Pedir proposta com esta avaliação ${ICON.arrow}</a></div>
        <button class="quiz__back" type="button">Recomeçar</button></div>`;
      $(".quiz__back", body).onclick = () => { step = 0; draw(); };
      track("quiz_complete", { tipo });
    };
    const draw = () => {
      if (step >= Q.length) return result();
      const q = Q[step];
      bar.style.width = (step / Q.length) * 100 + "%";
      body.innerHTML = `<p class="quiz__step-label">Pergunta ${step + 1} de ${Q.length}</p><p class="quiz__q">${q.q}</p>
        <div class="quiz__opts">${q.o.map((o) => `<button class="quiz__opt" type="button">${o}</button>`).join("")}</div>
        ${step ? '<button class="quiz__back" type="button">← Voltar</button>' : ""}`;
      $$(".quiz__opt", body).forEach((b) => b.addEventListener("click", () => { a[q.k] = b.textContent; step++; draw(); }));
      const back = $(".quiz__back", body);
      if (back) back.onclick = () => { step--; draw(); };
    };
    draw();
  }

  /* ---------- Formulários ---------- */
  function initForms(cfg) {
    // pré-preenchimento a partir do URL (quiz, botões de serviço, landing pages)
    const q = new URLSearchParams(location.search);
    const tipoSel = $("#f-tipo");
    if (tipoSel && q.get("tipo")) tipoSel.value = q.get("tipo");
    const desc = $("#f-ideia");
    if (desc && q.get("nota")) desc.value = "[Avaliação inicial] " + q.get("nota") + "\n\n";
    const prof = $("#f-profissao");
    if (prof && q.get("perfil")) prof.value = q.get("perfil");

    $$("form[data-buku-form]").forEach((form) => {
      const u = utm();
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "landing", "referrer", "campanha_pagina"].forEach((k) => {
        let inp = form.querySelector(`input[name="${k}"]`);
        if (!inp) { inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; form.appendChild(inp); }
        inp.value = u[k] || "";
      });
      let pg = form.querySelector('input[name="pagina"]');
      if (!pg) { pg = document.createElement("input"); pg.type = "hidden"; pg.name = "pagina"; form.appendChild(pg); }
      pg.value = location.pathname;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const status = $(".form__status", form);
        let ok = true;
        $$("[required]", form).forEach((inp) => {
          const field = inp.closest(".field");
          let valid = inp.value.trim() !== "";
          if (valid && inp.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
          if (valid && inp.type === "tel") valid = inp.value.replace(/\D/g, "").length >= 8;
          if (field) field.classList.toggle("has-error", !valid);
          if (!valid) ok = false;
        });
        if (!ok) { const f = $(".has-error input, .has-error select, .has-error textarea", form) || $("[required]:invalid", form); if (f) f.focus(); if (!$(".field", form) && status) { status.className = "form__status is-warn"; status.innerHTML = "<p>Indique um email válido.</p>"; } return; }

        const data = new FormData(form);
        const btn = $('button[type="submit"]', form);
        btn.disabled = true;
        const old = btn.innerHTML;
        btn.textContent = "A enviar…";

        const summary = () => {
          const lines = ["Olá BUKU! Acabei de preencher o formulário do site:"];
          ["nome", "telefone", "email", "profissao", "tipo_projecto", "prazo", "ideia"].forEach((k) => { if (data.get(k)) lines.push(`${k.replace("_", " ")}: ${data.get(k)}`); });
          if (data.get("utm_source")) lines.push("origem: " + data.get("utm_source"));
          return lines.join("\n");
        };

        let sent = false;
        if (/^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
          try {
            const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() });
            sent = res.ok;
          } catch (err) { sent = false; }
        }
        btn.disabled = false;
        btn.innerHTML = old;
        const isNews = form.dataset.bukuForm === "newsletter" || form.dataset.bukuForm === "guia";
        if (sent) {
          track("generate_lead", { form: form.dataset.bukuForm, source: data.get("utm_source") || "direct" });
          form.reset();
          status.className = "form__status is-ok";
          status.innerHTML = isNews
            ? "<p><strong>Obrigado!</strong> Vamos enviar o guia para o seu email.</p>"
            : `<p><strong>Pedido recebido.</strong> A nossa equipa responde em até 2 dias úteis.</p><a class="btn btn--sm btn--ghost" href="${waLink(cfg, summary())}" target="_blank" rel="noopener">Quer acelerar? Envie também por WhatsApp</a>`;
        } else {
          status.className = "form__status is-warn";
          status.innerHTML = isNews
            ? `<p>Não foi possível registar agora. Tente novamente mais tarde ou escreva para <a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>.</p>`
            : `<p>Não foi possível enviar o formulário neste momento. Envie o seu pedido directamente pelo WhatsApp — os dados já vão preenchidos.</p><a class="btn btn--sm btn--primary" href="${waLink(cfg, summary())}" target="_blank" rel="noopener">${ICON.wa} Enviar por WhatsApp</a>`;
        }
        status.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      $$("input, select, textarea", form).forEach((inp) => inp.addEventListener("input", () => { const f = inp.closest(".field"); if (f) f.classList.remove("has-error"); }));
    });
  }

  /* ---------- Vídeo de apresentação ---------- */
  function renderIntroVideo(cfg) {
    const el = $("#intro-video");
    if (!el || !cfg.video_apresentacao) return;
    el.innerHTML = videoEmbed(cfg.video_apresentacao, "Apresentação BUKU");
    el.hidden = false;
    initVideos();
  }

  /* ---------- Contactos dinâmicos ---------- */
  function fillContacts(cfg) {
    $$("[data-cfg]").forEach((el) => {
      const k = el.dataset.cfg;
      if (!cfg[k]) return;
      if (el.tagName === "A") el.href = k === "email" ? "mailto:" + cfg[k] : k === "telefone" ? "tel:" + cfg[k].replace(/\s/g, "") : cfg[k];
      if (!el.dataset.keepText) el.textContent = cfg[k];
    });
    $$("[data-social]").forEach((el) => { el.innerHTML = socialLinks(cfg, true); });
  }

  /* ---------- Arranque ---------- */
  // convites/recuperação de conta do painel (Netlify Identity) seguem para /admin/
  if (/(invite|recovery|confirmation)_token=/.test(location.hash) && !/\/admin\//.test(location.pathname)) {
    location.replace(ROOT + "admin/" + location.hash);
    return;
  }
  captureUtm();
  renderHeader();
  initReveal();
  initTimeline();
  initSvcNav();
  initQuiz();
  initVideos();
  load("definicoes").then((cfg) => {
    renderFooter(cfg);
    renderWhatsApp(cfg);
    fillContacts(cfg);
    initForms(cfg);
    initConsent(cfg);
    renderIntroVideo(cfg);
  });
  renderPortfolio();
  renderFeatured();
  renderObra();
  renderTestimonials();
  renderBlog();
  renderArtigo();
  $$("[data-book]").forEach((el) => { el.outerHTML = book(JSON.parse(el.dataset.book)); });
})();
