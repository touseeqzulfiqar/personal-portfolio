"use strict";

// ... آپ کا سارا پرانا کوڈ جیسا کا ویسا رہے گا ...

// ======== URL-BASED SECTION ROUTING ======== //
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.toLowerCase();
  const pathSegment = currentPath.split("/").filter(Boolean).pop(); // last part of path

  const pageMap = {
    youtube: "ytportfolio",
    webdevelopment: "webportfolio",
    appdevelopment: "resume",
  };

  const targetPage = pageMap[pathSegment];

  if (targetPage) {
    // Hide all sections
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show only the matched section
    const matchedPage = document.querySelector(`[data-page="${targetPage}"]`);
    if (matchedPage) {
      matchedPage.classList.add("active");
    }

    // Update navbar highlighting
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

    // Optional: scroll to top
    window.scrollTo(0, 0);
  }
});
