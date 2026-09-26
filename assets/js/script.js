"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------- Theme -------------------- */
const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  themeMeta?.setAttribute("content", theme === "dark" ? "#070B16" : "#F6F7FB");
};

applyTheme(root.getAttribute("data-theme") || "dark");

themeToggle?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* -------------------- Header & Mobile Menu -------------------- */
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuBtn = document.querySelector("[data-menu-btn]");

const setMenu = (open) => {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

menuBtn?.addEventListener("click", () => setMenu(!nav.classList.contains("open")));

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    menuBtn.focus();
  }
});

document.addEventListener("click", (e) => {
  if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
});

/* -------------------- Scroll: header, progress, back-to-top -------------------- */
const progress = document.querySelector("[data-scroll-progress]");
const toTop = document.querySelector("[data-to-top]");

const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 700);
  progress.style.setProperty("--progress", max > 0 ? y / max : 0);
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* -------------------- Active nav link -------------------- */
const navLinks = document.querySelectorAll("[data-nav-link]");
const sections = [...navLinks].map((link) => document.querySelector(link.getAttribute("href")));

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const match = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", match);
          if (match) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => section && sectionObserver.observe(section));
}

/* -------------------- Reveal on scroll -------------------- */
const revealEls = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  // stagger siblings that enter together
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
    // the hero is always on screen at load — animate it in right away
    if (el.closest(".hero-inner")) requestAnimationFrame(() => el.classList.add("revealed"));
    else revealObserver.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("revealed"));
}

/* -------------------- Card spotlight -------------------- */
if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* -------------------- Project filter -------------------- */
const filterBtns = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll(".project[data-category]");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    projects.forEach((project) => {
      const category = project.dataset.category;
      const show = filter === "all" || category === "all" || category === filter;
      project.classList.toggle("hidden", !show);
      if (show) project.classList.add("revealed");
    });
  });
});

/* -------------------- Numbers -------------------- */
document.querySelectorAll("[data-years-since]").forEach((el) => {
  const [year, month] = el.dataset.yearsSince.split("-").map(Number);
  const now = new Date();
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  const years = Math.max(1, Math.floor(months / 12));
  el.textContent = years;
  el.dataset.count = years;
});

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const countUp = (el) => {
  const target = Number(el.dataset.count);
  if (!target || reduceMotion) return;
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));
}

/* -------------------- Contact form -------------------- */
const form = document.querySelector("[data-form]");
const formBtn = document.querySelector("[data-form-btn]");
const formBtnText = document.querySelector("[data-form-btn-text]");
const formStatus = document.querySelector("[data-form-status]");

const setStatus = (message, type = "") => {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
};

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();

  formBtn.disabled = true;
  formBtnText.textContent = "Sending…";
  setStatus("");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Request failed");

    form.reset();
    setStatus("Thanks! Your message is on its way — I'll get back to you soon.", "success");
  } catch (error) {
    setStatus("Something went wrong. Please email me directly at touseeqzulfiqar@gmail.com.", "error");
  } finally {
    formBtn.disabled = false;
    formBtnText.textContent = "Send message";
  }
});

/* ==================== Interactions ==================== */

const canHover = window.matchMedia("(hover: hover)").matches;

/* -------------------- Toast & clipboard -------------------- */
const toast = document.querySelector("[data-toast]");
const toastText = document.querySelector("[data-toast-text]");
let toastTimer;

const showToast = (message) => {
  toastText.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Email copied to clipboard");
  } catch (e) {
    showToast(text);
  }
};

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => copyText(btn.dataset.copy));
});

/* -------------------- Typing line -------------------- */
const typer = document.querySelector("[data-typer]");

if (typer && !reduceMotion) {
  const words = typer.dataset.words.split("|");
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  const step = () => {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    typer.textContent = word.slice(0, charIndex);

    let delay = deleting ? 40 : 75;
    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 350;
    }
    setTimeout(step, delay);
  };

  setTimeout(step, 2400);
}

/* -------------------- Hero glow, tilt & magnetic buttons -------------------- */
if (canHover && !reduceMotion) {
  const hero = document.querySelector(".hero");
  const spotlight = document.querySelector("[data-hero-spotlight]");

  hero?.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    spotlight.style.setProperty("--hx", `${e.clientX - rect.left}px`);
    spotlight.style.setProperty("--hy", `${e.clientY - rect.top}px`);
  });

  const portrait = document.querySelector("[data-tilt]");
  const visual = portrait?.parentElement;

  visual?.addEventListener("pointermove", (e) => {
    const rect = visual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    portrait.classList.add("tilting");
    portrait.style.setProperty("--ry", `${x * 10}deg`);
    portrait.style.setProperty("--rx", `${y * -10}deg`);
  });

  visual?.addEventListener("pointerleave", () => {
    portrait.classList.remove("tilting");
    portrait.style.setProperty("--ry", "0deg");
    portrait.style.setProperty("--rx", "0deg");
  });

  document.querySelectorAll(".hero-actions .btn, .header-cta").forEach((btn) => {
    btn.classList.add("magnetic");
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* -------------------- Timeline fill -------------------- */
const timeline = document.querySelector(".timeline");

const updateTimeline = () => {
  if (!timeline) return;
  const rect = timeline.getBoundingClientRect();
  const start = window.innerHeight * 0.65;
  const fill = Math.min(Math.max((start - rect.top) / rect.height, 0), 1);
  timeline.style.setProperty("--fill", fill.toFixed(3));
};

window.addEventListener("scroll", updateTimeline, { passive: true });
updateTimeline();

/* -------------------- Local time -------------------- */
const localTime = document.querySelector("[data-local-time]");

const updateLocalTime = () => {
  if (!localTime) return;
  localTime.textContent = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });
};

updateLocalTime();
setInterval(updateLocalTime, 30000);

/* -------------------- Case studies -------------------- */
const caseStudies = {
  glowsims: {
    kicker: "Current role · Education ERP",
    title: "GLOWSIMS ERP",
    summary:
      "A live ERP platform from GLOWSIMS Educational Services that its users rely on in real time, every day. My job is to keep it stable, make it faster and easier to use, and extend it with new modules as the business grows.",
    points: [
      "Maintain and enhance a live ERP system used in real time, keeping daily operations running smoothly",
      "Develop and improve ERP modules with ASP.NET MVC and Microsoft SQL Server for better performance and usability",
      "Diagnose and resolve production issues quickly, delivering effective fixes to end-users",
      "Gather requirements from stakeholders and turn them into scalable technical solutions",
    ],
    stack: ["ASP.NET MVC", "C#", "SQL Server"],
    type: "Enterprise ERP · Production system (Aug 2025 — present)",
    heading: "What I do",
  },
  saas: {
    kicker: "SaaS Platform · Web App",
    title: "Service Provider SaaS",
    summary:
      "A multi-tenant SaaS platform where every business gets its own tailored experience, while admins stay in full control of who can see and do what.",
    points: [
      "Built a multi-tenant SaaS with unique views per tenant",
      "Implemented admin-controlled roles and permissions",
      "Designed a scalable architecture that keeps every tenant's data isolated",
    ],
    stack: ["Vue.js", "Laravel", "MySQL"],
    type: "Multi-tenant SaaS web application",
  },
  hazrify: {
    kicker: "HR · Web App",
    title: "Hazrify",
    summary:
      "An attendance and leave management platform that gives admins a live view of their team and gives employees a simple way to check in.",
    points: [
      "Developed attendance tracking with check-ins and leave management",
      "Implemented real-time attendance updates and reporting",
      "Designed role-based access control for admins and employees",
    ],
    stack: ["React", "NestJS", "GraphQL", "MySQL"],
    type: "HR & attendance web application",
  },
  lumpycare: {
    kicker: "Mobile · AI",
    title: "LumpyCare",
    summary:
      "A mobile app that helps detect lumpy skin disease in cattle from a single photo, putting an image-recognition model in the hands of farmers.",
    points: [
      "Developed a mobile app for detecting lumpy skin disease using image recognition",
      "Integrated a Convolutional Neural Network (CNN) model for disease detection",
      "Managed user data with Firebase and connected the app to the model via GraphQL",
    ],
    stack: ["React Native", "Firebase", "GraphQL", "Maps", "CNN"],
    type: "Cross-platform mobile app with AI",
  },
  pos: {
    kicker: "Retail · Web App",
    title: "Point of Sale",
    summary:
      "A point-of-sale system that brings inventory, billing and reporting together so a shop can run its day from one screen.",
    points: [
      "Developed a POS system with inventory management, billing and reporting",
      "Built RESTful APIs in Laravel for the Vue.js frontend",
      "Stored products, sales and inventory in MySQL",
    ],
    stack: ["Vue.js", "Laravel", "REST API", "MySQL"],
    type: "Retail web application",
  },
  bugzilla: {
    kicker: "Productivity · Web App",
    title: "Bugzilla",
    summary:
      "An issue tracker built around how real teams work, with separate workflows for managers, developers and QA.",
    points: [
      "Developed a role-based system with Manager, Developer and QA functionality",
      "Wrote RSpec tests to keep features reliable",
    ],
    stack: ["Ruby on Rails", "React", "PostgreSQL", "RSpec"],
    type: "Issue-tracking web application",
  },
  flour: {
    kicker: "Maintenance · Web App",
    title: "Flour Web",
    summary:
      "Ongoing engineering on a production Rails application — making it faster, more stable and more capable.",
    points: [
      "Optimized synchronous queries for improved performance",
      "Added new features and enhanced existing functionality",
      "Identified and resolved bugs to improve stability",
    ],
    stack: ["Ruby on Rails", "HAML", "PostgreSQL"],
    type: "Production web application",
  },
};

const caseDialog = document.querySelector("[data-case-dialog]");
const caseEl = (name) => caseDialog.querySelector(`[data-case-${name}]`);

const openCase = (id) => {
  const data = caseStudies[id];
  const card = document.querySelector(`[data-project="${id}"]`);
  if (!data || !caseDialog) return;

  caseEl("visual").replaceChildren(card.querySelector(".project-visual").cloneNode(true));
  caseEl("kicker").textContent = data.kicker;
  caseEl("title").textContent = data.title;
  caseEl("summary").textContent = data.summary;
  caseEl("type").textContent = data.type;
  caseEl("heading").textContent = data.heading || "What I built";
  caseEl("points").replaceChildren(
    ...data.points.map((point) => {
      const li = document.createElement("li");
      li.innerHTML = '<ion-icon name="checkmark-circle"></ion-icon>';
      li.append(document.createTextNode(point));
      return li;
    })
  );
  caseEl("stack").replaceChildren(
    ...data.stack.map((tech) => {
      const li = document.createElement("li");
      li.textContent = tech;
      return li;
    })
  );

  caseDialog.showModal();
  caseDialog.querySelector(".case-inner").scrollTop = 0;
};

document.querySelectorAll("[data-project]").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    openCase(card.dataset.project);
  });
});

caseDialog?.querySelectorAll("[data-case-close]").forEach((btn) => {
  btn.addEventListener("click", () => caseDialog.close());
});

caseDialog?.addEventListener("click", (e) => {
  if (e.target === caseDialog) caseDialog.close();
});

/* -------------------- Command palette -------------------- */
const cmdk = document.querySelector("[data-cmdk]");
const cmdkInput = document.querySelector("[data-cmdk-input]");
const cmdkList = document.querySelector("[data-cmdk-list]");
const cmdkEmpty = document.querySelector("[data-cmdk-empty]");
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

document.querySelectorAll(".cmdk-btn kbd").forEach((kbd) => {
  kbd.textContent = isMac ? "⌘K" : "Ctrl K";
});

const goTo = (hash) => {
  document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  history.replaceState(null, "", hash === "#top" ? location.pathname : hash);
};

const commands = [
  { group: "Navigate", label: "Home", icon: "home-outline", run: () => goTo("#top") },
  { group: "Navigate", label: "Services", icon: "grid-outline", run: () => goTo("#services") },
  { group: "Navigate", label: "Projects", icon: "briefcase-outline", run: () => goTo("#work"), keys: "work portfolio" },
  { group: "Navigate", label: "Experience", icon: "trending-up-outline", run: () => goTo("#experience"), keys: "resume career jobs" },
  { group: "Navigate", label: "Tech stack", icon: "layers-outline", run: () => goTo("#stack"), keys: "skills tools" },
  { group: "Navigate", label: "How I work", icon: "git-branch-outline", run: () => goTo("#process"), keys: "process" },
  { group: "Navigate", label: "Testimonials", icon: "chatbubbles-outline", run: () => goTo("#testimonials"), keys: "reviews clients" },
  { group: "Navigate", label: "FAQ", icon: "help-circle-outline", run: () => goTo("#faq"), keys: "questions" },
  { group: "Navigate", label: "Contact", icon: "paper-plane-outline", run: () => goTo("#contact"), keys: "hire message" },
  { group: "Actions", label: "Copy email address", icon: "copy-outline", run: () => copyText("touseeqzulfiqar@gmail.com"), keys: "mail" },
  { group: "Actions", label: "Download CV", icon: "download-outline", hint: "PDF", run: () => document.querySelector("a[download]")?.click(), keys: "resume" },
  { group: "Actions", label: "Toggle light / dark theme", icon: "contrast-outline", run: () => themeToggle.click(), keys: "mode" },
  { group: "Actions", label: "Open LinkedIn", icon: "logo-linkedin", hint: "↗", run: () => window.open("https://www.linkedin.com/in/touseeq-zulfiqar-521510200/", "_blank", "noopener") },
  { group: "Actions", label: "Open GitHub", icon: "logo-github", hint: "↗", run: () => window.open("https://github.com/touseeqzulfiqar", "_blank", "noopener") },
  ...Object.entries(caseStudies).map(([id, data]) => ({
    group: "Case studies",
    label: data.title,
    icon: "document-text-outline",
    run: () => openCase(id),
    keys: `${data.stack.join(" ")} project`,
  })),
];

let visibleCommands = commands;
let activeIndex = 0;

const runCommand = (i) => {
  const command = visibleCommands[i];
  if (!command) return;
  cmdk.close();
  command.run();
};

const renderCommands = () => {
  const q = cmdkInput.value.trim().toLowerCase();
  visibleCommands = commands.filter((c) => `${c.label} ${c.group} ${c.keys || ""}`.toLowerCase().includes(q));
  activeIndex = Math.min(activeIndex, Math.max(visibleCommands.length - 1, 0));

  const nodes = [];
  let lastGroup = "";
  visibleCommands.forEach((c, i) => {
    if (c.group !== lastGroup) {
      const g = document.createElement("li");
      g.className = "cmdk-group";
      g.textContent = c.group;
      g.setAttribute("role", "presentation");
      nodes.push(g);
      lastGroup = c.group;
    }
    const li = document.createElement("li");
    li.className = `cmdk-item${i === activeIndex ? " active" : ""}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", i === activeIndex);
    li.innerHTML = `<ion-icon name="${c.icon}"></ion-icon>`;
    li.append(document.createTextNode(c.label));
    if (c.hint) {
      const hint = document.createElement("span");
      hint.className = "cmdk-hint";
      hint.textContent = c.hint;
      li.append(hint);
    }
    li.addEventListener("click", () => runCommand(i));
    li.addEventListener("pointermove", () => {
      if (activeIndex === i) return;
      cmdkList.querySelector(".cmdk-item.active")?.classList.remove("active");
      li.classList.add("active");
      activeIndex = i;
    });
    nodes.push(li);
  });

  cmdkList.replaceChildren(...nodes);
  cmdkEmpty.hidden = visibleCommands.length > 0;
  cmdkList.querySelector(".cmdk-item.active")?.scrollIntoView({ block: "nearest" });
};

const openCmdk = () => {
  if (cmdk.open) return;
  cmdkInput.value = "";
  activeIndex = 0;
  renderCommands();
  cmdk.showModal();
  cmdkInput.focus();
};

document.querySelectorAll("[data-cmdk-open]").forEach((btn) => btn.addEventListener("click", openCmdk));

cmdkInput?.addEventListener("input", () => {
  activeIndex = 0;
  renderCommands();
});

cmdkInput?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const n = visibleCommands.length;
    if (!n) return;
    activeIndex = (activeIndex + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
    renderCommands();
  } else if (e.key === "Enter") {
    e.preventDefault();
    runCommand(activeIndex);
  }
});

cmdk?.addEventListener("click", (e) => {
  if (e.target === cmdk) cmdk.close();
});

document.addEventListener("keydown", (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName || "");
  if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    if (cmdk.open) cmdk.close();
    else openCmdk();
  } else if (e.key === "/" && !typing && !cmdk.open && !caseDialog.open) {
    e.preventDefault();
    openCmdk();
  }
});
