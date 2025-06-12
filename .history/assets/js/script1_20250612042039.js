"use strict";

// =========================
// Your existing full code...
// =========================
// KEEP YOUR EXISTING CODE AS IT IS

// Add this at the END of your file
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.toLowerCase();
  const pathSegment = currentPath.split("/").filter(Boolean).pop(); // get last part

  const pageMap = {
    youtube: "ytportfolio",
    webdevelopment: "webportfolio",
    appdevelopment: "resume",
  };

  const targetPage = pageMap[pathSegment];

  if (targetPage) {
    // Deactivate all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Activate matching page
    const matchedPage = document.querySelector(`[data-page="${targetPage}"]`);
    if (matchedPage) {
      matchedPage.classList.add("active");
    }

    // Set active class on navbar button
    navigationLinks.forEach((btn) => {
      if (
        btn.innerHTML
          .toLowerCase()
          .includes(targetPage.replace("portfolio", ""))
      ) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }
});
