# MK Plastic Surgery · breast reduction landing page

Static site hosted on Vercel (project `manaf-lp`, live at lp.mkplasticsurgeon.co.uk).

- `index.html` — homepage: an index of the landing pages. Add a card here for each new landing page.
- `breast-reduction/index.html` — breast reduction landing page (/breast-reduction/).
- `thank-you/index.html` — form thank-you page (/thank-you/).
- Shared `css/`, `js/`, `img/`. Pages live in subfolders, so always use root-relative paths (`/img/...`).
- `vercel.json` has `trailingSlash: true`, so `/breast-reduction` redirects to `/breast-reduction/`.

## Workflow

- Commit and push every change straight to `main`. Do not use feature branches or pull requests.
- Vercel deploys `main` to production automatically on every push, so a push is a release.
- Before pushing, check the change at desktop and phone widths (no horizontal scroll, no console errors).
