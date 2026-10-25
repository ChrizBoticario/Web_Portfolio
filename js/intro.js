(() => {
  const root = document.documentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navigation = performance.getEntriesByType("navigation")[0];
  const isReload = navigation?.type === "reload";
  const isHistoryReturn = navigation?.type === "back_forward";
  let cameFromBlog = false;
  try {
    const referrer = new URL(document.referrer);
    cameFromBlog = !isReload && referrer.origin === location.origin
      && referrer.pathname.toLowerCase().endsWith("/blog.html");
  } catch {}

  if (motion.matches || !Element.prototype.animate || isHistoryReturn || cameFromBlog) return;

  let page;
  let stage;
  let finished = false;
  let restoreScroll = null;
  const animations = [];

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(watchdog);
    document.removeEventListener("DOMContentLoaded", start);
    window.removeEventListener("resize", finish);
    window.removeEventListener("pagehide", finish);
    motion.removeEventListener("change", finish);
    animations.forEach(animation => animation.cancel());
    root.classList.remove("intro-active");
    if (page) page.inert = false;
    stage?.remove();
    if (restoreScroll !== null) {
      window.scrollTo({ top: restoreScroll, behavior: "instant" });
      const hashTarget = document.getElementById(location.hash.slice(1));
      if (hashTarget) hashTarget.scrollIntoView({ behavior: "instant" });
    }
    window.dispatchEvent(new Event("portfolio:intro-finished"));
  };

  const start = () => {
    if (finished) return;
    try {
      page = document.querySelector("[data-intro-page]");
      stage = document.querySelector(".intro-stage");
      if (!page || !stage || motion.matches) {
        finish();
        return;
      }
      restoreScroll = window.scrollY;
      page.inert = true;
      page.scrollTop = restoreScroll;

      const animate = (element, keyframes, options) => {
        const animation = element.animate(keyframes, options);
        animations.push(animation);
        return animation;
      };

      // The real page is clipped to the viewport only during expansion.
      // Removing intro-active restores the original sticky/fixed containing blocks.
      const expansion = animate(page, [
        { transform: "scale(0.025)", opacity: 0, boxShadow: "0 0 0 0 #2586ff00", offset: 0 },
        { transform: "scale(0.09)", opacity: 1, boxShadow: "0 0 45px 8px #2586ffcc", offset: 0.1 },
        { transform: "scale(0.94)", opacity: 1, boxShadow: "0 0 32px 3px #2586ff66", offset: 0.65 },
        { transform: "scale(1)", opacity: 1, boxShadow: "0 0 0 0 #2586ff00", offset: 1 }
      ], { delay: 900, duration: 1100, easing: "cubic-bezier(0.22, 0.7, 0.25, 1)", fill: "both" });

      const sphere = stage.querySelector(".intro-sphere");
      animate(sphere, [
        { transform: "translateY(calc(50vh + 30px)) scale(0.7)", opacity: 0, offset: 0 },
        { transform: "translateY(calc(50vh - 30px)) scale(0.8)", opacity: 1, offset: 0.12 },
        { transform: "translateY(0) scale(1)", opacity: 1, offset: 1 }
      ], { delay: 300, duration: 600, easing: "cubic-bezier(0.55, 0.05, 0.75, 0.5)", fill: "both" });
      animate(sphere, [{ opacity: 1 }, { opacity: 0 }],
        { delay: 900, duration: 160, fill: "forwards" });
      animate(stage.querySelector(".intro-wave"), [
        { transform: "scale(1)", opacity: 0 },
        { transform: "scale(5)", opacity: 0.4, offset: 0.18 },
        { transform: "scale(24)", opacity: 0 }
      ], { delay: 900, duration: 650, easing: "ease-out", fill: "both" });

      expansion.finished.then(finish, finish);
    } catch {
      finish();
    }
  };

  // Set up the fail-open deadline before hiding anything, even if startup fails.
  const watchdog = window.setTimeout(finish, 3500);
  root.classList.add("intro-active");
  document.addEventListener("DOMContentLoaded", start, { once: true });
  window.addEventListener("resize", finish, { once: true });
  window.addEventListener("pagehide", finish, { once: true });
  motion.addEventListener("change", finish, { once: true });
})();
