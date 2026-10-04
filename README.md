# GLAMORGAN TOY DRIVE — school toy-drive website

A student-run toy-drive presentation website (Glamorgan School, Grade 8 project).
Static site: `index.html`, `styles.css`, `script.js`, `assets/`, `Dockerfile`.

## Run locally

    python -m http.server 8123 --bind 127.0.0.1
    # open http://127.0.0.1:8123/

## Docker (nginx:alpine)

    docker build -t glamorgan-toy-drive .
    docker run --rm -p 8080:80 glamorgan-toy-drive

The `Dockerfile` is ready for GitHub Pages and Render:

  - **GitHub Pages**: push this folder as a repo (main branch, root) and enable
    GitHub Pages.
  - **Render**: "New Web Service" → Connect repo → Root directory = this folder
    → Deploy. Render serves port 80 by default (the `EXPOSE 80` in the Dockerfile).

## What's in here

  - `index.html` — 7 slides (s1–s7): hero, why, how, toys, team, why/how/where,
    final CTA. Progress bar, slide dots, counter, pledge/confetti.
  - `styles.css` — responsive design (breakpoints 1080 / 920 / 640 / 390), the
    block-letter title system (`.bl` with wood fill + coloured outline).
  - `script.js` — block-title builder, scroll reveals, slide tracking, hero
    parallax, pledge button, bug-report, back-to-top.
  - `assets/` — toy photos + team portraits + image credits.
