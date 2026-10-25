# Background Renderer

The site background is procedural and rendered by `js/background-webgl.js`. If WebGL is unavailable, `js/background.js` provides the 2D-canvas fallback. The former background-video system was retired and its three MP4 assets (1080p, 720p, and 4K source) were removed on 2026-10-25. No background video asset is required.

The shader renderer supports mouse-movement distortion, responsive sizing with a pixel cap, reduced-motion handling, and a navy fade into the work section. The 2D fallback has its own adaptive render budget.

Project demonstration videos are stored separately under `assets/videos/projects/`; they are unaffected by the background change.
