# Background Video

The adaptive background-video system uses these local assets:

- `web_bg_1080p.mp4`: desktop target, 1920 x 1080, H.264, approximately 3-5 Mb/s.
- `web_bg_720p.mp4`: mobile and lower-bandwidth target, 1280 x 720, H.264, approximately 1.5-2.5 Mb/s.
- `web_bg_4k.mp4`: retained local 3840 x 2160 H.264 source; excluded from publication.
- `../../images/background/web_bg_poster.png`: static fallback poster.

`Main.html` intentionally has no default video source. `js/main.js` selects the source before loading it:

- Viewport width `>= 1024px`: desktop 1080p source.
- Viewport width `< 1024px`: mobile 720p source.
- Save Data or `2g`/`slow-2g`: mobile 720p source.
- Reduced motion: static poster and no video playback.
- Missing optimized source: use the static poster instead of downloading the local 4K source.

The optimized 1080p and 720p files are present. Keep `web_bg_4k.mp4` locally as an original source; do not publish it or use it as a web fallback.

Recommended export settings:

- MP4/H.264
- 16:9 aspect ratio
- `1920x1080` desktop and `1280x720` mobile
- Short seamless loop
- Video bitrate prioritized for visual quality, approximately 3-5 Mb/s desktop and 1.5-2.5 Mb/s mobile
- Dark enough for white hero text to remain readable
