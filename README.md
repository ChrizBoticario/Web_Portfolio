# Chriz Portfolio

A framework-free portfolio built with semantic HTML, CSS, and vanilla JavaScript. It is designed for direct deployment to GitHub Pages.

<!--
## Update points

- Public contact details: `js/main.js`
- Project content and media paths: `js/projects.js`
- Blog posts content: `blog.html`
- Procedural background renderer: `js/background-webgl.js`, with `js/background.js` as the fallback.
- Resume PDF: add `documents/Chriz_CV.pdf`, then set `resume` in `js/main.js`

## Template locations

Use these when adding new portfolio content:

- New project card template: `js/projects.js`, inside the large `PROJECT POST TEMPLATE` comment near the top of the file.
- New blog post template: `blog.html`, inside the `BLOG POST TEMPLATE` comment inside `.blog-list`.
- Background renderer implementation: `js/background-webgl.js` and its 2D fallback, `js/background.js`.
- Project video storage guide: `assets/videos/projects/README.md`.

## Project content template

To add a new project, copy the object shown in `js/projects.js` and paste it into the `projects` array.

```js
{
  title: "Project name",
  oneLine: "One short evidence-focused statement.",
  summary: "Concise summary of what the project does, why it matters, and what it demonstrates.",
  video: "assets/videos/projects/project-name/showcase.mp4",
  poster: "assets/images/projects/project-name/thumbnail.png",
  github: "https://github.com/ChrizBoticario/repository-name"
}
```

### What to put in each project field

- `title`: Use the project name recruiters will remember. Keep it short, specific, and readable.
- `oneLine`: Write one direct evidence-focused sentence. Say what the project is or proves, not a vague slogan.
- `summary`: Explain the problem, what you built, your technical choices, and the result. Keep it concise, around 2-4 sentences.
- `video`: Add a short demo video path when available. The video should show the actual app or workflow, not only a logo or intro screen.
- `poster`: Add a thumbnail image path if you have one. Use a clear screenshot of the app or project result.
- `github`: Add the repository URL. Leave it empty only if the project source is not ready to show yet.

Strong project summary structure:

```text
I built [what] for [user/problem]. It uses [main technologies or architecture] to [important behavior]. The project demonstrates [skill recruiters should notice], especially [specific technical detail].
```

Project content checklist:

- What problem does this solve?
- Who would use it?
- What did you personally build?
- What technologies, APIs, data, or architecture are worth noticing?
- What makes the implementation practical, reliable, or user-friendly?
- What should a recruiter understand after watching the demo?

Avoid project entries that only say things like "this is my project" or "still updating" once real content is available. Replace placeholders with concrete evidence as soon as each project is ready.
Project videos should be stored in:

```text
assets/videos/projects/<project-name>/showcase.mp4
```

Project images or thumbnails should be stored in:

```text
assets/images/projects/<project-name>/thumbnail.png
```

## Blog post template

To add a new blog post, copy and paste the following block into `blog.html` inside the `.blog-list` container. Place new posts at the **top** of the list. The blog stack is newest at the top, oldest at the bottom. The home page latest-blog container automatically reads the top post.

```html
<article class="blog-post" data-blog-post>
  <div class="blog-post-inner">
    <span class="blog-post-date">DD/MM/YYYY</span>
    <h3 class="blog-post-title">Your Blog Post Title</h3>
    <div class="blog-post-body">
      <p>Your blog post content goes here. The first paragraph also appears in the home page latest-blog preview.</p>
    </div>
  </div>
</article>
```

### What to put in each blog post

- `blog-post-date`: Use `DD/MM/YYYY`. This controls newest-to-oldest sorting.
- `blog-post-title`: Use a clear title about the decision, lesson, build, or technical idea.
- First paragraph: This is important because it also appears in the home page latest-blog preview. Make it a strong short summary.
- Additional paragraphs: Use them for the actual explanation, build notes, lessons learned, or reasoning.
- Optional `id`: You can add a stable id like `id="agentic-engineering-notes"`. If you do not add one, JavaScript creates one from the date and title.

Strong blog post structure:

```text
Paragraph 1: Short summary of the idea or project decision.
Paragraph 2: What problem or context led to it.
Paragraph 3: What you learned, changed, built, or decided.
Paragraph 4: What you would improve next or what the post proves about your thinking.
```

Blog content checklist:

- What did I build, learn, test, or decide?
- Why did it matter?
- What tradeoff did I consider?
- What technical detail proves I understand the work?
- What would a company learn about how I think?

Good blog topics for this portfolio:

- Project build logs.
- Internship preparation notes.
- Software engineering lessons.
- Agentic engineering experiments.
- Architecture decisions from your own projects.
- Debugging stories with a clear lesson.

Keep posts professional and specific. A recruiter should finish the post with a clearer sense of your judgment, not just your activity.
## Local preview

The pages can be opened directly, or served with any static file server from this directory.

```powershell
Set-Location "C:\Users\CHRIZ BOTICARIO\Agent_Workspace\Projects\Web_Portfolio\Website_Codes"
node serve-local.cjs
```

Then open:

```text
http://127.0.0.1:8765/
```

`index.html` is the GitHub Pages entry point and redirects to `Main.html`. The local server's `/` route also serves `Main.html` directly.
## Procedural background

The portfolio background is rendered locally by `js/background-webgl.js`, with `js/background.js` as its 2D-canvas fallback. It does not require background video files. Project demonstration videos remain supported under `assets/videos/projects/`.

## Current implementation notes

- The three retired background MP4 assets have been removed. Project-demo MP4 files remain supported in `assets/videos/projects/`.
- `Main.html` layers a procedural liquid-marble canvas behind the page. The WebGL renderer supports pointer-reactive distortion, resizing, reduced motion, tab/viewport visibility handling, and a bounded pixel budget; the 2D fallback adapts its workload to performance.
- The animated intro is implemented in `js/intro.js` and `css/intro.css`. It skips reduced-motion users, browser history returns, and navigation back from the blog.
- Project and blog cards reveal on viewport entry. Activating a project or blog card scrolls it toward the viewport center; activating links inside cards preserves link behavior.
- Blog entries live in `blog.html`, newest first. The homepage preview reads the current top post. The newest entry is “Web Portfolio update” dated `25/10/2026`.
- Blog page heading is centered, and blog-card hover/focus uses the same neon-navy border/glow as project cards (`#3f7dff`).
- The native scrollbar is hidden and replaced with an overlay scrollbar controlled by `css/style.css` and `js/main.js`.
- The private `.md/` folder contains current state, architecture, handoff, history, validation, and agent guidance. Prefer those current notes over superseded historical claims.
-->
