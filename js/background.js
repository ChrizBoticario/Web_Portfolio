(() => {
  "use strict";
  const canvas = document.querySelector("[data-marble-background]");
  const context = canvas?.getContext("2d", { alpha: false });
  if (!context) return;

  const host = canvas.parentElement;
  const work = document.querySelector(".work-section");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const tau = Math.PI * 2;
  const sine = new Float32Array(8192);
  for (let i = 0; i < sine.length; i++) sine[i] = Math.sin(i * tau / sine.length);
  const sin = value => sine[(value * (8192 / tau)) & 8191];

  // Read the same CSS color used by the page and its transition.
  const navyHex = getComputedStyle(host).getPropertyValue("--navy").trim();
  const navy = [1, 3, 5].map(offset => parseInt(navyHex.slice(offset, offset + 2), 16));
  const stops = [
    [0, [3, 4, 7]], [0.36, navy], [0.68, [12, 31, 57]],
    [0.9, [22, 55, 91]], [1, [36, 77, 120]]
  ];
  const palette = new Uint8ClampedArray(1024 * 3);
  for (let i = 0; i < 1024; i++) {
    const value = i / 1023;
    const upper = stops.findIndex(stop => stop[0] >= value);
    const [lowAt, low] = stops[Math.max(0, upper - 1)];
    const [highAt, high] = stops[upper];
    const blend = highAt === lowAt ? 0 : (value - lowAt) / (highAt - lowAt);
    for (let c = 0; c < 3; c++) palette[i * 3 + c] = low[c] + (high[c] - low[c]) * blend;
  }

  let frame = 0;
  let lastTime = 0;
  let time = 0;
  let image;
  let xCoordinates;
  let yCoordinates;
  let visible = true;
  let disposed = false;
  let quality = 1;
  let averageCost = 0;
  let samples = 0;
  const frameInterval = 1000 / 30;

  const layoutTop = element => {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    // Finish the fade where the opaque work section begins, even on tall screens.
    const end = work ? Math.max(0, Math.min(height, layoutTop(work) - layoutTop(host))) : height;
    host.style.setProperty("--marble-end", `${end}px`);
    // A bounded pixel budget avoids full-resolution noise work on high-DPI screens.
    const budget = (width < 700 ? 95000 : 160000) * quality;
    const scale = Math.min(1, Math.sqrt(budget / (width * height)));
    const nextWidth = Math.max(1, Math.round(width * scale));
    const nextHeight = Math.max(1, Math.round(height * scale));
    if (image && canvas.width === nextWidth && canvas.height === nextHeight) return;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    image = context.createImageData(canvas.width, canvas.height);
    for (let i = 3; i < image.data.length; i += 4) image.data[i] = 255;
    xCoordinates = new Float32Array(canvas.width);
    yCoordinates = new Float32Array(canvas.height);
    // Isotropic coordinates retain natural curves in portrait and landscape.
    const unit = Math.min(width, height);
    for (let x = 0; x < canvas.width; x++) xCoordinates[x] = (x / canvas.width - 0.5) * width / unit * 3.8;
    for (let y = 0; y < canvas.height; y++) yCoordinates[y] = (y / canvas.height - 0.5) * height / unit * 3.8;
    render();
  }

  function render() {
    if (!image) return;
    const pixels = image.data;
    const drift = time * 0.075;
    let pixel = 0;
    for (let y = 0; y < canvas.height; y++) {
      const v = yCoordinates[y];
      for (let x = 0; x < canvas.width; x++) {
        const u = xCoordinates[x];
        // Nested domain warps fold broad ribbons into fine, irregular veins.
        const qx = u + 0.85 * sin(v * 1.55 + drift) + 0.4 * sin(u * 1.8 + v * 1.2 - drift * 0.7);
        const qy = v + 0.75 * sin(u * 1.35 - drift * 0.8) + 0.35 * sin(v * 2.1 - u * 0.8 + drift);
        const rx = qx + 0.5 * sin(qy * 2.8 + drift * 0.6) + 0.22 * sin(qx * 3.2 - qy * 1.7);
        const ry = qy + 0.5 * sin(qx * 2.5 - drift * 0.5) + 0.2 * sin(qy * 3.8 + qx);
        const field = rx * 2.1 + ry * 1.35 + 1.25 * sin(rx * 1.5 - ry * 1.6 + drift * 0.25);
        const band = sin(field * 3.1 + 0.7 * sin(field * 1.3 + ry * 2));
        const ribbon = (band + 1) * 0.5;
        const fine = (sin(field * 9.3 + ry * 0.6) + 1) * 0.5;
        const fine2 = fine * fine;
        const fine6 = fine2 * fine2 * fine2;
        const vein = fine6 * fine6;
        const shade = 0.68 + 0.32 * (sin(rx * 0.9 + ry * 1.2 - 0.7) + 1) * 0.5;
        const value = Math.min(1, (ribbon * ribbon * 0.85 + vein * 0.15) * shade);
        const color = Math.round(value * 1023) * 3;
        pixels[pixel++] = palette[color];
        pixels[pixel++] = palette[color + 1];
        pixels[pixel++] = palette[color + 2];
        pixel++;
      }
    }
    context.putImageData(image, 0, 0);
  }

  function tick(now) {
    frame = 0;
    if (!canvas.isConnected) { dispose(); return; }
    if (document.hidden || !visible || motion.matches) return;
    if (!lastTime) lastTime = now;
    const elapsed = now - lastTime;
    if (elapsed >= frameInterval - 1) {
      time += Math.min(elapsed, 100) / 1000;
      lastTime = now;
      const start = performance.now();
      render();
      averageCost += (performance.now() - start - averageCost) * 0.1;
      // Reduce work only after a sustained over-budget run; never oscillate quality.
      if (++samples >= 60 && averageCost > 19 && quality > 0.55) {
        quality *= 0.75;
        samples = 0;
        resize();
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (disposed) return;
    if (!canvas.isConnected) { dispose(); return; }
    if (motion.matches) render();
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }

  const sizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  // Covers removal while paused, when there is no animation frame to detect it.
  const removalObserver = new MutationObserver(() => {
    if (!canvas.isConnected) dispose();
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    events.abort();
    sizeObserver.disconnect();
    visibilityObserver.disconnect();
    removalObserver.disconnect();
    image = null;
  }

  motion.addEventListener("change", sync, { signal: events.signal });
  document.addEventListener("visibilitychange", sync, { signal: events.signal });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    lastTime = 0;
  }, { signal: events.signal });
  window.addEventListener("pageshow", sync, { signal: events.signal });
  sizeObserver.observe(host);
  if (work?.parentElement) sizeObserver.observe(work.parentElement);
  visibilityObserver.observe(host);
  removalObserver.observe(document.body, { childList: true, subtree: true });
  resize();
  sync();
})();
