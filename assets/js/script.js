"use strict";

document.documentElement.classList.add("js");

/* -------------------- Element Toggle Function -------------------- */
const elementToggle = (elem) => elem.classList.toggle("active");

/* -------------------- Sidebar Toggle -------------------- */
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
const sidebarBtnText = document.querySelector("[data-sidebar-btn-text]");

sidebarBtn?.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("active");
  sidebarBtn.setAttribute("aria-expanded", isOpen);
  sidebarBtn.setAttribute("aria-label", isOpen ? "Hide contacts" : "Show contacts");
  if (sidebarBtnText) sidebarBtnText.textContent = isOpen ? "Hide Contacts" : "Show Contacts";
});

/* -------------------- Testimonials Modal -------------------- */
const testimonialsItems = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const modalAvatar = document.querySelector("[data-modal-avatar]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalRole = document.querySelector("[data-modal-role]");
const modalText = document.querySelector("[data-modal-text]");

let lastFocused = null;

const openModal = (item) => {
  modalAvatar.textContent = item.querySelector("[data-testimonials-avatar]").textContent;
  modalTitle.textContent = item.querySelector("[data-testimonials-title]").textContent;
  modalRole.textContent = item.querySelector("[data-testimonials-role]").textContent;
  modalText.innerHTML = item.querySelector("[data-testimonials-text]").innerHTML;

  lastFocused = item;
  modalContainer.classList.add("active");
  overlay.classList.add("active");
  modalCloseBtn.focus();
};

const closeModal = () => {
  if (!modalContainer.classList.contains("active")) return;
  modalContainer.classList.remove("active");
  overlay.classList.remove("active");
  lastFocused?.focus();
};

testimonialsItems.forEach((item) => {
  item.addEventListener("click", () => openModal(item));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(item);
    }
  });
});

modalCloseBtn?.addEventListener("click", closeModal);
overlay?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* -------------------- Project Filter -------------------- */
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterItemsByCategory = (category) => {
  filterItems.forEach((item) => {
    item.classList.toggle("active", category === "all" || item.dataset.category === category);
  });
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filterBtn === category);
  });
};

select?.addEventListener("click", () => elementToggle(select));

selectItems.forEach((item) => {
  item.addEventListener("click", () => {
    selectValue.innerText = item.innerText;
    elementToggle(select);
    filterItemsByCategory(item.dataset.selectItem);
  });
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectValue.innerText = btn.innerText;
    filterItemsByCategory(btn.dataset.filterBtn);
  });
});

/* -------------------- Scroll Reveal -------------------- */
const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

const revealPage = (page) => {
  page.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el, i) => {
    if (!revealObserver) return el.classList.add("revealed");
    el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
    revealObserver.observe(el);
  });
};

/* -------------------- Page Navigation -------------------- */
const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// old shared links (e.g. #/webdevelopment) keep working
const routeAliases = {
  webdevelopment: "projects",
  webportfolio: "projects",
  portfolio: "projects",
  appdevelopment: "resume",
  youtube: "about",
};

const showPage = (name, { updateHash = true, scroll = true } = {}) => {
  const target = document.querySelector(`[data-page="${name}"]`) ? name : "about";

  pages.forEach((page) => {
    const match = page.dataset.page === target;
    page.classList.toggle("active", match);
    if (match) revealPage(page);
  });

  navLinks.forEach((link) => {
    const match = link.dataset.navLink === target;
    link.classList.toggle("active", match);
    if (match) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (updateHash) history.replaceState(null, "", target === "about" ? location.pathname : `#${target}`);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
};

navLinks.forEach((link) => {
  link.addEventListener("click", () => showPage(link.dataset.navLink));
});

document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => showPage(btn.dataset.goto));
});

const pageFromHash = () => {
  const route = location.hash.toLowerCase().replace(/^#\/?/, "");
  return routeAliases[route] || route || "about";
};

window.addEventListener("hashchange", () => showPage(pageFromHash(), { updateHash: false }));

showPage(pageFromHash(), { updateHash: false, scroll: false });

/* -------------------- Card Spotlight -------------------- */
if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
  document
    .querySelectorAll(".service-item, .project-item, .stat-item, .skills-group, .quick-contact-card")
    .forEach((card) => {
      card.classList.add("spotlight");
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
}

/* -------------------- Dynamic Numbers -------------------- */
document.querySelectorAll("[data-years-since]").forEach((el) => {
  const [year, month] = el.dataset.yearsSince.split("-").map(Number);
  const now = new Date();
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  el.textContent = Math.max(1, Math.floor(months / 12));
});

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* -------------------- Contact Form -------------------- */
const form = document.querySelector("[data-form]");
const formBtn = document.querySelector("[data-form-btn]");
const formBtnText = document.querySelector("[data-form-btn-text]");
const formStatus = document.querySelector("[data-form-status]");

const setStatus = (message, type) => {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
};

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();

  formBtn.disabled = true;
  formBtnText.textContent = "Sending…";
  setStatus("", "");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Email not sent");

    form.reset();
    setStatus("Thank you! Your message has been sent — I'll be in touch soon.", "success");
  } catch (error) {
    setStatus("Something went wrong. Please try again or email me directly.", "error");
  } finally {
    formBtn.disabled = false;
    formBtnText.textContent = "Send Message";
  }
});
