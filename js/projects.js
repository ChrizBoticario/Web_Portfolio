(() => {
  const projectList = document.querySelector("[data-project-list]");
  if (!projectList) return;

  /*
    PROJECT POST TEMPLATE
    =====================
    To add a new project card, copy the object below into the `projects` array.
    Put newest or strongest projects near the top if you want them shown first.

    Video files:
    - Store project demos in: assets/videos/projects/<project-folder>/showcase.mp4
    - Keep demos short and web-friendly, preferably 16:9 MP4 / H.264.

    Poster/thumbnail files:
    - Store project thumbnails in: assets/images/projects/<project-folder>/thumbnail.png
    - Leave `poster` empty if you do not have one yet.

    Template object:
    {
      title: "Project name",
      oneLine: "One short evidence-focused statement.",
      summary: "Concise summary of what the project does, why it matters, and what it demonstrates.",
      video: "assets/videos/projects/project-name/showcase.mp4",
      poster: "assets/images/projects/project-name/thumbnail.png",
      github: "https://github.com/ChrizBoticario/repository-name"
    }
  */
  const projects = [
    {
      title: "Featured Project 01",
      oneLine: "A practical software build prepared for portfolio evidence.",
      summary: "Project summary pending. This space is reserved for a concise explanation of the software, the user problem it solves, and the engineering decisions worth showing to recruiters.",
      video: "",
      poster: "",
      github: ""
    },
    {
      title: "Featured Project 02",
      oneLine: "A project slot ready for a short visual walkthrough.",
      summary: "Project summary pending. The final copy will focus on what was built, why it mattered, how the interface works, and what the result demonstrates technically.",
      video: "",
      poster: "",
      github: ""
    },
    {
      title: "Featured Project 03",
      oneLine: "A third project placeholder for stronger selection balance.",
      summary: "Project summary pending. This slot is ready for another project with strong visual evidence, clear source code, and a concise technical narrative.",
      video: "",
      poster: "",
      github: ""
    }
  ];

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const createMedia = (project) => {
    const media = createElement("div", "project-media");
    if (project.video) {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      if (project.poster) video.poster = project.poster;
      const source = document.createElement("source");
      source.src = project.video;
      source.type = "video/mp4";
      video.append(source);
      media.append(video);
    } else {
      const empty = createElement("div", "project-media-empty");
      empty.append(createElement("strong", "", "SHOWCASE MEDIA PENDING"));
      empty.append(createElement("span", "", "16:9 / MP4 or WebM"));
      media.append(empty);
    }
    return media;
  };

  const createLink = (label, url) => {
    const link = createElement("a", url ? "" : "is-disabled", label);
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
    } else {
      link.setAttribute("aria-disabled", "true");
    }
    return link;
  };

  projects.forEach((project, index) => {
    const article = createElement("article", "project reveal");
    article.tabIndex = 0;
    article.setAttribute("aria-label", `${project.title}. Select to center this project.`);
    article.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 90}ms`);
    const header = createElement("div", "project-header");
    header.append(createElement("h3", "", project.title));
    const details = createElement("div", "project-details");
    details.append(createElement("p", "project-description", project.oneLine));
    details.append(createElement("p", "project-summary", project.summary));
    const links = createElement("div", "project-links");
    links.append(createLink("View project on GitHub", project.github));
    details.append(links);
    article.append(header, createMedia(project), details);
    projectList.append(article);
  });

  // Reveal animation is handled globally by main.js observer on .reveal elements.

  const centerProject = (project) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = project.getBoundingClientRect();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
    const viewportCenter = headerHeight + (window.innerHeight - headerHeight) / 2;
    const destination = Math.min(
      maxScroll,
      Math.max(0, window.scrollY + rect.top + (rect.height / 2) - viewportCenter)
    );

    window.scrollTo({
      top: destination,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  const shouldIgnoreProjectActivation = (target) => (
    target instanceof Element && Boolean(target.closest("a[href], button, input, select, textarea, video[controls]"))
  );

  projectList.addEventListener("click", (event) => {
    const project = event.target instanceof Element ? event.target.closest(".project") : null;
    if (!project || shouldIgnoreProjectActivation(event.target)) return;
    centerProject(project);
  });

  projectList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const project = event.target instanceof Element ? event.target.closest(".project") : null;
    if (!project || event.target !== project) return;
    event.preventDefault();
    centerProject(project);
  });

})();
