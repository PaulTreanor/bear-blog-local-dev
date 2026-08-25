# Wikipedia theme

A Bear Blog theme styled after Wikipedia.

## Install

| Step | Where in Bear | What |
| --- | --- | --- |
| 1 | Dashboard → **Custom CSS** | Paste all of `styles.css` |
| 2 | Settings → **Header directive** | Paste both `<script>` blocks from `index.html`'s `<head>` — year grouping and search (paid accounts only) |
| 3 | Homepage **content box** | See below |

Leave the blog's **date format** at the default `d M, Y`. The script formats the index dates itself, so post pages keep their year.

## Homepage content box

```html
<div class="ambox ambox-notice">
  <div class="ambox-text">
    <p class="ambox-title">Hi, welcome to my website</p>
    <p>Your intro paragraph.</p>
  </div>
</div>

## Blog Posts

{{ posts }}
```

One `{{ posts }}` is all you need — the script does the grouping, so there's nothing to update when a new year starts.

## What the script does

Takes Bear's flat `<ul class="blog-posts">` and:

1. Groups it into `<h3>` year headings, reading the `datetime` attribute (years stay in document order, so Bear's `order:` still applies).
2. Rewrites each date to `12 Apr` — zero-padded day, 3-letter month.
3. Moves the date `<span>` after the title `<a>`, so entries read `Title (12 Apr)`. Done in the DOM because `display: flex` on an `<li>` would drop the disc marker.

It only touches pages containing `ul.blog-posts`, so post pages are left alone.

## Free accounts

The CSS works fully. The script does not — Bear's `clean()` strips `<script>` from unupgraded blogs, and `header_directive` only renders when `upgraded` is true. You'd get a flat chronological list with Bear's normal dates: complete and readable, just ungrouped. Same fallback applies to anyone browsing with JS off.  .
