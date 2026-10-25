# Project Demo Videos

Store short project demonstration videos here.

This directory is only for project media. The site's background is rendered procedurally by `js/background-webgl.js` (with a 2D-canvas fallback) and does not use files from this directory.

Recommended structure:

`project-name/showcase.mp4`

Then update the matching project entry in `js/projects.js`:

```js
video: "assets/videos/projects/project-name/showcase.mp4"
```

Recommended export:

- MP4, H.264
- 16:9 aspect ratio
- Short, focused walkthrough
- Optimized file size for web loading
