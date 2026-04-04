async function loadComponent(selector, path) {
  const mountNode = document.querySelector(selector);
  if (!mountNode) return null;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load component: ${path}`);
    }

    const html = await response.text();
    mountNode.innerHTML = html;
    return mountNode;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getComponentPath(fileName) {
  return `./components/${fileName}`;
}

function normalizePath(path) {
  if (!path) return "/";
  return path.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
}

function getCurrentPageKey() {
  const fileName = window.location.pathname.split("/").pop() || "index.html";
  return fileName.replace(".html", "");
}

function setActiveNav(headerRoot) {
  if (!headerRoot) return;

  const currentKey = getCurrentPageKey();
  const navLinks = headerRoot.querySelectorAll(".site-nav a[data-nav]");

  navLinks.forEach((link) => {
    const key = link.dataset.nav;
    const isActive = key === currentKey;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function bindMobileNav(headerRoot) {
  if (!headerRoot) return;

  const navToggle = headerRoot.querySelector(".nav-toggle");
  const siteNav = headerRoot.querySelector(".site-nav");

  if (!navToggle || !siteNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindLangSwitcher(headerRoot) {
  if (!headerRoot) return;

  const langLink = headerRoot.querySelector("[data-lang-switch]");
  if (!langLink) return;

  const body = document.body;
  const pathname = window.location.pathname;
  const isEnglishPage = pathname.includes("/en/");

  console.log("[lang]", {
    pathname,
    isEnglishPage,
    zhUrl: body.dataset.zhUrl,
    enUrl: body.dataset.enUrl
  });

  if (isEnglishPage) {
    const zhUrl = body.dataset.zhUrl || "../index.html";
    langLink.setAttribute("href", zhUrl);
    langLink.textContent = "中文";
    langLink.setAttribute("aria-label", "Switch to Traditional Chinese");
  } else {
    const enUrl = body.dataset.enUrl || "./en/index.html";
    langLink.setAttribute("href", enUrl);
    langLink.textContent = "EN";
    langLink.setAttribute("aria-label", "Switch to English");
  }
}

function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  const toggleVisibility = () => {
    if (window.scrollY > 360) {
      backToTopButton.classList.add("is-visible");
    } else {
      backToTopButton.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  toggleVisibility();
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

async function initSharedHeader() {
  await loadComponent("#site-header", getComponentPath("header.html"));

  const headerRoot = document.querySelector("#site-header");
  if (!headerRoot) return;

  setActiveNav(headerRoot);
  bindMobileNav(headerRoot);
  bindLangSwitcher(headerRoot);
}

async function initSharedFooter() {
  await loadComponent("#site-footer", getComponentPath("footer.html"));
}

async function initSharedLayout() {
  await initSharedHeader();
  await initSharedFooter();

  initBackToTop();
  initHeaderScroll();
}

document.addEventListener("DOMContentLoaded", initSharedLayout);