(() => {
  "use strict";
  const canvas = document.querySelector("[data-marble-background]");
  const host = canvas?.parentElement;
  if (!canvas || !host) return;

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false
  });
  if (!gl) {
    const fallback = document.createElement("script");
    fallback.src = new URL("background.js", document.currentScript.src).href;
    document.head.append(fallback);
    return;
  }

  const work = document.querySelector(".work-section");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const maxPixels = 3_000_000;
  const frameInterval = 1000 / 30;
  const cursorFollow = 9;
  const cursorDecay = 3.2;
  const cursorRadius = 0.82;
  const maxCursorSpeed = 4.2;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let visible = true;
  let disposed = false;
  let cursorSeen = false;
  let pointerInside = false;
  let pointerClientX = 0;
  let pointerClientY = 0;
  let pointerTime = 0;
  let pointerStrength = 0;
  let pointerSpeed = 0;
  let pointerDirectionX = 0;
  let pointerDirectionY = 0;
  let flowX = 0;
  let flowY = 0;
  let cursorX = 0.5;
  let cursorY = 0.5;

  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_cursor;
    uniform vec2 u_flow;
    uniform float u_disturbance;

    vec3 marbleColor(float value) {
      vec3 ink = vec3(3.0, 4.0, 7.0) / 255.0;
      vec3 navy = vec3(7.0, 19.0, 32.0) / 255.0;
      vec3 deep = vec3(12.0, 31.0, 57.0) / 255.0;
      vec3 blue = vec3(22.0, 55.0, 91.0) / 255.0;
      vec3 highlight = vec3(36.0, 77.0, 120.0) / 255.0;
      if (value < 0.36) return mix(ink, navy, value / 0.36);
      if (value < 0.68) return mix(navy, deep, (value - 0.36) / 0.32);
      if (value < 0.9) return mix(deep, blue, (value - 0.68) / 0.22);
      return mix(blue, highlight, (value - 0.9) / 0.1);
    }

    void main() {
      float unit = min(u_resolution.x, u_resolution.y);
      vec2 p = (gl_FragCoord.xy / u_resolution - 0.5) * u_resolution / unit * 3.8;
      float drift = u_time * 0.075;
      vec2 cursor = (u_cursor - 0.5) * u_resolution / unit * 3.8;
      vec2 offset = p - cursor;
      float distanceToCursor = length(offset);
      vec2 radial = offset / max(distanceToCursor, 0.0001);
      vec2 flowDirection = u_flow / max(length(u_flow), 0.0001);
      float influence = exp(-distanceToCursor * distanceToCursor / (${cursorRadius.toFixed(2)} * ${cursorRadius.toFixed(2)}));
      float ripple = sin(distanceToCursor * 17.0 - u_time * 2.8);
      float push = u_disturbance * (0.025 + u_disturbance * 0.075) * ripple * influence;
      vec2 tangent = vec2(-radial.y, radial.x);
      p += radial * push
        + tangent * sin(distanceToCursor * 12.0 - u_time * 1.7) * influence * u_disturbance * 0.045
        + flowDirection * influence * u_disturbance * 0.075;
      float qx = p.x + 0.85 * sin(p.y * 1.55 + drift)
        + 0.4 * sin(p.x * 1.8 + p.y * 1.2 - drift * 0.7);
      float qy = p.y + 0.75 * sin(p.x * 1.35 - drift * 0.8)
        + 0.35 * sin(p.y * 2.1 - p.x * 0.8 + drift);
      float rx = qx + 0.5 * sin(qy * 2.8 + drift * 0.6)
        + 0.22 * sin(qx * 3.2 - qy * 1.7);
      float ry = qy + 0.5 * sin(qx * 2.5 - drift * 0.5)
        + 0.2 * sin(qy * 3.8 + qx);
      float field = rx * 2.1 + ry * 1.35
        + 1.25 * sin(rx * 1.5 - ry * 1.6 + drift * 0.25);
      float band = sin(field * 3.1 + 0.7 * sin(field * 1.3 + ry * 2.0));
      float ribbon = (band + 1.0) * 0.5;
      float fine = (sin(field * 9.3 + ry * 0.6) + 1.0) * 0.5;
      float vein = pow(fine, 12.0);
      float shade = 0.68 + 0.32 * (sin(rx * 0.9 + ry * 1.2 - 0.7) + 1.0) * 0.5;
      float value = min(1.0, (ribbon * ribbon * 0.85 + vein * 0.15) * shade);
      gl_FragColor = vec4(marbleColor(value), 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Marble shader compilation failed: ${message}`);
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Marble shader link failed: ${gl.getProgramInfoLog(program)}`);
  }

  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
  const timeUniform = gl.getUniformLocation(program, "u_time");
  const cursorUniform = gl.getUniformLocation(program, "u_cursor");
  const flowUniform = gl.getUniformLocation(program, "u_flow");
  const disturbanceUniform = gl.getUniformLocation(program, "u_disturbance");

  const layoutTop = element => {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;

    const fadeEnd = work ? Math.max(0, Math.min(height, layoutTop(work) - layoutTop(host))) : height;
    host.style.setProperty("--marble-end", `${fadeEnd}px`);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const capScale = Math.min(1, Math.sqrt(maxPixels / (width * height * pixelRatio * pixelRatio)));
    const scale = pixelRatio * capScale;
    const bufferWidth = Math.max(1, Math.floor(width * scale));
    const bufferHeight = Math.max(1, Math.floor(height * scale));
    if (canvas.width === bufferWidth && canvas.height === bufferHeight) return;

    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
    gl.viewport(0, 0, bufferWidth, bufferHeight);
    gl.uniform2f(resolutionUniform, bufferWidth, bufferHeight);
    render();
  }

  function render() {
    if (disposed || !canvas.isConnected) return;
    gl.uniform1f(timeUniform, elapsed);
    gl.uniform2f(cursorUniform, cursorX, cursorY);
    gl.uniform2f(flowUniform, flowX, flowY);
    gl.uniform1f(disturbanceUniform, pointerStrength);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function updateCursor(deltaSeconds, now) {
    const bounds = host.getBoundingClientRect();
    const inside = pointerInside && pointerClientX >= bounds.left && pointerClientX <= bounds.right
      && pointerClientY >= bounds.top && pointerClientY <= bounds.bottom;
    let targetX = cursorX;
    let targetY = cursorY;
    if (inside && bounds.width && bounds.height) {
      targetX = (pointerClientX - bounds.left) / bounds.width;
      targetY = 1 - (pointerClientY - bounds.top) / bounds.height;
    }

    const follow = 1 - Math.exp(-cursorFollow * deltaSeconds);
    cursorX += (targetX - cursorX) * follow;
    cursorY += (targetY - cursorY) * follow;

    const idleSeconds = Math.max(0, (now - pointerTime - 90) / 1000);
    const motionFade = Math.exp(-cursorDecay * idleSeconds);
    const activeStrength = inside && !motion.matches ? pointerSpeed * motionFade : 0;
    const flowFade = Math.exp(-5.5 * deltaSeconds);
    const flowTargetX = inside && !motion.matches ? pointerDirectionX * pointerSpeed * motionFade : 0;
    const flowTargetY = inside && !motion.matches ? pointerDirectionY * pointerSpeed * motionFade : 0;
    flowX += (flowTargetX - flowX) * (1 - flowFade);
    flowY += (flowTargetY - flowY) * (1 - flowFade);
    pointerStrength += (activeStrength - pointerStrength) * (1 - Math.exp(-7 * deltaSeconds));
  }

  function trackPointer(event) {
    if (event.pointerType !== "mouse" || motion.matches || !canvas.isConnected) return;
    const now = performance.now();
    const bounds = host.getBoundingClientRect();
    const wasInside = pointerInside;
    pointerInside = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;

    if (cursorSeen && wasInside && pointerInside && pointerTime) {
      const seconds = Math.max((now - pointerTime) / 1000, 0.008);
      const scale = 3.8 / Math.max(1, Math.min(bounds.width, bounds.height));
      const dx = (event.clientX - pointerClientX) * scale / seconds;
      const dy = -(event.clientY - pointerClientY) * scale / seconds;
      const speed = Math.hypot(dx, dy);
      pointerSpeed = Math.min(maxCursorSpeed, speed) / maxCursorSpeed;
      if (speed > 0.0001) {
        pointerDirectionX = dx / speed;
        pointerDirectionY = dy / speed;
      }
    } else {
      pointerSpeed = 0;
      pointerDirectionX = 0;
      pointerDirectionY = 0;
    }

    pointerClientX = event.clientX;
    pointerClientY = event.clientY;
    pointerTime = now;
    cursorSeen = true;
  }

  function leaveViewport(event) {
    if (event.relatedTarget === null) pointerInside = false;
  }

  function tick(now) {
    frame = 0;
    if (!canvas.isConnected) {
      dispose();
      return;
    }
    if (document.hidden || !visible || motion.matches) return;

    if (!lastFrame) lastFrame = now;
    if (now - lastFrame >= frameInterval - 1) {
      const deltaSeconds = Math.min(now - lastFrame, 100) / 1000;
      elapsed += deltaSeconds;
      lastFrame = now;
      updateCursor(deltaSeconds, now);
      render();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    if (disposed) return;
    if (!canvas.isConnected) {
      dispose();
      return;
    }
    if (motion.matches) {
      pointerStrength = 0;
      flowX = 0;
      flowY = 0;
      render();
    }
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }

  const sizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
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
    gl.deleteBuffer(vertices);
    gl.deleteProgram(program);
  }

  motion.addEventListener("change", sync, { signal: events.signal });
  window.addEventListener("pointermove", trackPointer, { passive: true, signal: events.signal });
  window.addEventListener("pointerout", leaveViewport, { passive: true, signal: events.signal });
  document.addEventListener("visibilitychange", sync, { signal: events.signal });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    lastFrame = 0;
  }, { signal: events.signal });
  window.addEventListener("pageshow", sync, { signal: events.signal });
  sizeObserver.observe(host);
  if (work?.parentElement) sizeObserver.observe(work.parentElement);
  visibilityObserver.observe(host);
  removalObserver.observe(document.body, { childList: true, subtree: true });
  resize();
  sync();
})();
