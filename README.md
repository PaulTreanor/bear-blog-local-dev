# Bear blog local dev env

This is my repo for developing Bear Blog themes in a local environment. Rather than developing themes in the Bear Blog dashboard's CSS input box, and hitting "publish" to see the changes, I can develop them locally.

## CSS workflow

Bearblog compiles CSS into the HTML document for each page as a `<style>` tag. In this workflow I separate CSS into a `styles.css` file and import it into the HTML using a `<link>`. Serve with VSCode's Live Server for a fast feedback loop.

## Content workflow (Markdown separation)

Bear Blog's dashboard gives you a Markdown input box (raw HTML passes through untouched) for content, and a separate CSS box for styling. `markdown-separate-experiement/` mirrors that split without any build step:

- `content.md` — the raw Markdown, exactly what you'd paste into Bear's content box
- `index.html` — the page shell/chrome (header, nav, footer). `<main id="content">` is an empty render target
- On load, a script fetches `content.md`, renders it with [marked.js](https://marked.js.org/) (loaded from a CDN, no install needed), and injects the result into `<main>`

Bear replaces a `{{ posts }}` tag in the content box with the rendered post list HTML, but the exact object/template behind that isn't public. Rather than reverse-engineer it, just paste the post list HTML directly into `content.md` — Markdown passes raw HTML through as-is, so this works and stays visually accurate.

To preview: serve the folder with Live Server and open `index.html`. Edit `content.md` and refresh to see changes — no build step.

### Creating local dev env for your own blog

To recreate this for your own blog pages, copy your page's HTML as actually served (open your blog page, press `cmd/ctrl` + `u`, then copy that).

Run `prettier` on the HTML you copy in, since it'll be an unformatted mess:

```bash
npx prettier --write default-bear-blog
npx prettier --write --use-tabs default-bear-blog
```
