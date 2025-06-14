"use strict";

/* -------------------- Element Toggle Function -------------------- */
const elementToggle = (elem) => elem.classList.toggle("active");

/* -------------------- Sidebar Toggle -------------------- */
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
sidebarBtn?.addEventListener("click", () => elementToggle(sidebar));

/* -------------------- Testimonials Modal -------------------- */
const testimonialsItems = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const toggleModal = () => {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

testimonialsItems.forEach((item) => {
  item.addEventListener("click", () => {
    modalImg.src = item.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = item.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = item.querySelector(
      "[data-testimonials-title]"
    ).innerHTML;
    modalText.innerHTML = item.querySelector(
      "[data-testimonials-text]"
    ).innerHTML;
    toggleModal();
  });
});

modalCloseBtn?.addEventListener("click", toggleModal);
overlay?.addEventListener("click", toggleModal);

/* -------------------- Custom Select Filter -------------------- */
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterItemsByCategory = (selectedValue) => {
  filterItems.forEach((item) => {
    const match =
      selectedValue === "all" || item.dataset.category === selectedValue;
    item.classList.toggle("active", match);
  });
};

select?.addEventListener("click", () => elementToggle(select));

selectItems.forEach((item) => {
  item.addEventListener("click", () => {
    const value = item.innerText.toLowerCase();
    selectValue.innerText = item.innerText;
    elementToggle(select);
    filterItemsByCategory(value);
  });
});

let lastActiveFilterBtn = filterBtns[0];
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.innerText.toLowerCase();
    selectValue.innerText = btn.innerText;
    filterItemsByCategory(value);

    lastActiveFilterBtn?.classList.remove("active");
    btn.classList.add("active");
    lastActiveFilterBtn = btn;
  });
});

/* -------------------- Page Navigation -------------------- */
const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navLinks.forEach((link, index) => {
  link.addEventListener("click", () => {
    const selectedPage = link.innerText.toLowerCase();
    pages.forEach((page, i) => {
      const match = selectedPage === page.dataset.page;
      page.classList.toggle("active", match);
      navLinks[i].classList.toggle("active", match);
    });
    window.scrollTo(0, 0);
  });
});

/* -------------------- Route-Based Page Loading -------------------- */
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.toLowerCase();
  const route = hash.replace(/^#\//, "");
  const routeMap = {
    youtube: "ytportfolio",
    webdevelopment: "webportfolio",
    appdevelopment: "resume",
  };
  const target = routeMap[route];
  if (!target) return;

  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === target);
  });

  navLinks.forEach((link) => {
    const cleanText = link.innerText.toLowerCase().replace(/\s/g, "");
    link.classList.toggle("active", target.includes(cleanText));
  });

  window.scrollTo(0, 0);
});

/* -------------------- Contact Form Logic -------------------- */
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const messageBox = document.getElementById("form-message");

formInputs.forEach((input) => {
  input.addEventListener("input", () => {
    formBtn.disabled = !form.checkValidity();
  });
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  formBtn.disabled = true;

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      messageBox.textContent = "✅ Thank you! Your message has been sent.";
      messageBox.style.display = "block";
    } else {
      throw new Error("Email not sent");
    }
  } catch (error) {
    messageBox.textContent = "❌ Oops! Something went wrong.";
    messageBox.style.display = "block";
  } finally {
    formBtn.disabled = false;
  }
});
