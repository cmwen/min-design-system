# Forest & Fern — Codex handoff

- **PRD.md**: detailed implementation brief, constraints, milestones and acceptance tests.
- **reference.html**: interactive standalone browser mockup based on the approved Forest & Fern Living Surface prototype. Open directly in a browser; Google Fonts may require network access. It is **visual reference only**, not production CSS.

Implementation principles: **CSS-first**, **no Tailwind dependency**, **native HTML controls**, **light/dark forest themes**, **asymmetric organic shapes**, **subtle waves with performance fallback**, **Web Components only for genuinely new behavioral UI later**.

Suggested Codex prompt:

> Implement Forest & Fern according to PRD.md, using reference.html as visual intent. Build a single Vite-powered GitHub Pages repo with reusable modular CSS, an interactive playground, demos and tests. Do not implement React components or Web Components in the MVP. Prioritize accessibility, cross-browser fallback and wave-animation performance. Implement the work and run available tests.
