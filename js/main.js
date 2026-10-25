// Edit public contact details here. Empty URLs stay visibly disabled.
window.PORTFOLIO_CONFIG = Object.freeze({
  github: {
    display: "@ChrizBoticario",
    value: "https://github.com/ChrizBoticario"
  },
  email: {
    display: "chrizboticario [ at ] gmail [ dot ] com",
    value: "chrizboticario@gmail.com"
  },
  linkedin: "https://www.linkedin.com/in/chriz-boticario-026060381/",
  resume: ""
});

(() => {
  const config = window.PORTFOLIO_CONFIG;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  let scrollAnimationFrame;

  const initFooter = () => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;

    footer.innerHTML = `
      <p class="footer-degree">Bachelor of Science in Computer Science with Specialization in Software Engineering</p>
      <nav class="footer-contact-line" aria-label="Contact and profile links">
        <a href="${config.github.value}" target="_blank" rel="noreferrer" data-footer-link="github">Github:<strong>${config.github.display}</strong></a>
        <span aria-hidden="true">·</span>
        <button type="button" data-copy="email">email:<strong>${config.email.display}</strong></button>
      </nav>
      <nav class="footer-profile-line" aria-label="Profile links">
        <a href="${config.linkedin}" target="_blank" rel="noreferrer" data-footer-link="linkedin">linkedin:<strong>Chriz Boticario</strong></a>
      </nav>
      <a class="back-to-top" href="#top">Back to top</a>
    `;
  };

  // Initialize consistently injected footer before binding events
  initFooter();

  const closeNavigation = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !open);
  });
  navigation?.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", closeNavigation));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      menuToggle?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNavigation();
  }, { passive: true });

  document.querySelectorAll("[data-contact-display]").forEach((element) => {
    const key = element.dataset.contactDisplay;
    if (config[key]) element.textContent = config[key].display;
  });

  let toastTimer;
  const showToast = (message) => {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "site-toast";
      toast.dataset.toast = "";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };
  const fallbackCopy = (value) => {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  };

  const copyValue = async (key) => {
    const item = config[key];
    if (!item?.value) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(item.value);
        return true;
      }
      return fallbackCopy(item.value);
    } catch {
      return fallbackCopy(item.value);
    }
  };

  let isProcessingCopy = false;
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button || isProcessingCopy) return;

    isProcessingCopy = true;
    const key = button.dataset.copy;
    const copied = await copyValue(key);
    if (key === "email") {
      showToast(copied ? "Email copied!" : "Email copy failed");
    } else {
      showToast(copied ? "GitHub URL copied" : "GitHub copy failed");
    }
    setTimeout(() => { isProcessingCopy = false; }, 300);
  });

  const scrollToTarget = (target) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 12);

    if (reducedMotion) {
      window.scrollTo({ top: destination, behavior: "auto" });
      return;
    }

    window.cancelAnimationFrame(scrollAnimationFrame);
    const start = window.scrollY;
    const distance = destination - start;
    const duration = 450;
    const startTime = performance.now();
    const easeInOutCubic = (progress) => (
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - ((-2 * progress + 2) ** 3) / 2
    );

    const animateScroll = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo({ top: start + distance * easeInOutCubic(progress), behavior: "auto" });
      if (progress < 1) scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
    };

    scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
  };

  document.querySelector("[data-home-brand]")?.addEventListener("click", (event) => {
    event.preventDefault();
    closeNavigation();
    scrollToTarget(document.body);
    history.replaceState(null, "", window.location.pathname);
  });
  document.querySelectorAll('a[href^="#"], a[href*=".html#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      closeNavigation();
      scrollToTarget(target);
      history.pushState(null, "", url.hash);
    });
  });

  const headerGithub = document.querySelector('[data-header-link="github"]');
  if (headerGithub && config.github.value && !config.github.value.includes("your-username")) {
    headerGithub.href = config.github.value;
    headerGithub.target = "_blank";
    headerGithub.rel = "noreferrer";
    headerGithub.classList.remove("is-disabled");
    headerGithub.removeAttribute("aria-disabled");
  }

  // Wait until after defer scripts run (projects.js creates .reveal elements)
  document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, {
        rootMargin: "-8% 0px -8% 0px",
        threshold: 0.12
      });
      revealItems.forEach((item) => observer.observe(item));
    }
  });


  const parseBlogDate = (value) => {
    const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return 0;
    const [, day, month, year] = match.map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const createBlogPostId = (date, title) => {
    const slug = `${date}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug ? `post-${slug}` : "blog-post";
  };

  const ensureBlogPostId = (post) => {
    if (post.id) return post.id;
    const date = post.querySelector(".blog-post-date")?.textContent.trim() || "date";
    const title = post.querySelector(".blog-post-title")?.textContent.trim() || "untitled";
    post.id = createBlogPostId(date, title);
    return post.id;
  };
  const getBlogPostData = (post) => {
    const title = post.querySelector(".blog-post-title")?.textContent.trim() || "Blog title";
    const date = post.querySelector(".blog-post-date")?.textContent.trim() || "DD/MM/YYYY";
    const statement = post.querySelector(".blog-post-body p")?.textContent.trim() || "Statement placeholder word for a future writing note about software, learning, and engineering decisions.";
    return {
      id: ensureBlogPostId(post),
      title,
      date,
      statement
    };
  };

  const sortBlogPostsNewestFirst = (root = document) => {
    const list = root.querySelector(".blog-list");
    if (!list) return [];

    const posts = [...list.querySelectorAll("[data-blog-post]")];
    posts
      .sort((a, b) => parseBlogDate(getBlogPostData(b).date) - parseBlogDate(getBlogPostData(a).date))
      .forEach((post) => list.appendChild(post));

    return posts;
  };

  const initHomeBlogPreview = async () => {
    const preview = document.querySelector(".blog-preview");
    if (!preview) return;

    try {
      const response = await fetch("blog.html", { cache: "no-store" });
      if (!response.ok) return;

      const html = await response.text();
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const newest = sortBlogPostsNewestFirst(parsed)[0];
      if (!newest) return;

      const data = getBlogPostData(newest);
      preview.href = `blog.html#${data.id}`;
      preview.querySelector(".blog-kicker").textContent = data.date;
      preview.querySelector("strong").textContent = data.title;
      preview.querySelector(".blog-statement").textContent = data.statement;
    } catch {
      // Keep the static preview if the page is opened directly from the file system.
    }
  };

  const centerBlogPost = (post) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const rect = post.getBoundingClientRect();
    const destination = Math.max(
      0,
      window.scrollY + rect.top - ((window.innerHeight - rect.height) / 2) - (headerHeight / 2)
    );

    window.scrollTo({
      top: destination,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  const initBlogScrollCenter = () => {
    const list = document.querySelector(".blog-list");
    if (!list) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const posts = sortBlogPostsNewestFirst(document);
    posts.forEach((post, index) => {
      post.classList.add("reveal");
      post.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 90}ms`);
      post.tabIndex = 0;
      post.setAttribute("role", "button");
      post.setAttribute("aria-label", `Center blog post: ${getBlogPostData(post).title}`);
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
      posts.forEach((post) => post.classList.add("is-visible"));
    } else {
      const blogObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.14
      });
      posts.forEach((post) => blogObserver.observe(post));
    }

    list.addEventListener("click", (event) => {
      const post = event.target.closest("[data-blog-post]");
      if (post) centerBlogPost(post);
    });

    list.addEventListener("keydown", (event) => {
      const post = event.target.closest("[data-blog-post]");
      if (!post || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      centerBlogPost(post);
    });

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target?.matches("[data-blog-post]")) {
        window.setTimeout(() => centerBlogPost(target), 120);
      }
    }
  };

  const initPageScrollbar = () => {
    const track = document.createElement("div");
    const thumb = document.createElement("div");
    track.className = "page-scrollbar";
    thumb.className = "page-scrollbar-thumb";
    track.setAttribute("role", "scrollbar");
    track.setAttribute("aria-label", "Page scroll");
    track.setAttribute("aria-controls", "main-content");
    track.setAttribute("aria-orientation", "vertical");
    track.setAttribute("aria-valuemin", "0");
    track.tabIndex = 0;
    track.append(thumb);
    document.body.append(track);

    let frame = 0;
    let dragOffset = null;
    let maxScroll = 0;
    let travel = 0;
    let idleTimer;

    const hideAfterIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => track.classList.add("is-hidden"), 1000);
    };
    const revealForActivity = () => {
      track.classList.remove("is-hidden");
      hideAfterIdle();
    };

    const render = () => {
      frame = 0;
      const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      maxScroll = Math.max(0, scrollHeight - window.innerHeight);
      track.hidden = maxScroll <= 1;
      if (track.hidden) return;

      const height = Math.min(192, track.clientHeight);
      travel = track.clientHeight - height;
      thumb.style.height = `${height}px`;
      thumb.style.transform = `translateY(${travel * window.scrollY / maxScroll}px)`;
      track.setAttribute("aria-valuemax", String(Math.round(maxScroll)));
      track.setAttribute("aria-valuenow", String(Math.round(window.scrollY)));
    };

    const scheduleRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const scrollFromPointer = (clientY) => {
      const top = track.getBoundingClientRect().top;
      const position = Math.max(0, Math.min(travel, clientY - top - dragOffset));
      window.scrollTo({ top: travel ? position / travel * maxScroll : 0, behavior: "instant" });
    };

    track.addEventListener("pointerdown", (event) => {
      if (track.hidden || event.button !== 0) return;
      revealForActivity();
      window.cancelAnimationFrame(scrollAnimationFrame);
      dragOffset = event.target === thumb
        ? event.clientY - thumb.getBoundingClientRect().top
        : thumb.offsetHeight / 2;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
      if (event.target !== thumb) scrollFromPointer(event.clientY);
      event.preventDefault();
    });
    track.addEventListener("pointermove", (event) => {
      if (dragOffset !== null) {
        revealForActivity();
        scrollFromPointer(event.clientY);
      }
    });
    const stopDrag = () => {
      dragOffset = null;
      track.classList.remove("is-dragging");
      revealForActivity();
    };
    track.addEventListener("pointerup", stopDrag);
    track.addEventListener("pointercancel", stopDrag);
    track.addEventListener("keydown", (event) => {
      const step = Math.max(40, window.innerHeight * 0.1);
      const destinations = {
        ArrowUp: window.scrollY - step,
        ArrowDown: window.scrollY + step,
        PageUp: window.scrollY - window.innerHeight,
        PageDown: window.scrollY + window.innerHeight,
        Home: 0,
        End: maxScroll
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      revealForActivity();
      window.scrollTo({ top: destinations[event.key], behavior: "instant" });
    });

    window.addEventListener("scroll", () => {
      scheduleRender();
      revealForActivity();
    }, { passive: true });
    window.addEventListener("resize", scheduleRender, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(scheduleRender).observe(document.body);
    scheduleRender();

    if (document.documentElement.classList.contains("intro-active")) {
      window.addEventListener("portfolio:intro-finished", revealForActivity, { once: true });
    } else {
      revealForActivity();
    }
  };

  initPageScrollbar();
  initHomeBlogPreview();
  initBlogScrollCenter();

})();
