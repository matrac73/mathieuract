# Experience pages

Each experience of the career list has its own page: `/<locale>/experience/<slug>`
(slugs: adagia, onepoint, essec, bcg-x, safran, centralesupelec, prepa — see `career` in `src/content/site.ts`).

- Long text: `content/experiences/<slug>.fr.md` and `<slug>.en.md` (Markdown). While the file is missing, the page shows an empty slot.
- Images: drop them in `public/experiences/<slug>/` (jpg, png, webp); they are shown in file-name order. While the folder is empty, the page shows three empty slots.
