/**
 * anchor-links.js
 *
 * Adds anchor/permalink functionality to markdown headers. When hovering over
 * any h1-h6 element, a subtle link icon appears that can be clicked to jump
 * to that heading or copy its URL.
 *
 * Headers without an id attribute get a unique slug generated from their text.
 * The anchor link is hidden by default and reveals on hover, similar to the
 * Stripe documentation style.
 */
(function () {
	"use strict";

	var STYLE_ID = "anchor-links-styles";
	var LINK_ICON_CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
	var PROCESSED_ATTR = "data-anchor-processed";

	var CSS_TEXT = [
		"#content h1,",
		"#content h2,",
		"#content h3,",
		"#content h4,",
		"#content h5,",
		"#content h6 {",
		"	position: relative;",
		"}",
		"",
		".anchor-link {",
		"	position: relative;",
		"	display: inline-flex;",
		"	align-items: center;",
		"	justify-content: center;",
		"	margin-left: 0.5em;",
		"	opacity: 0;",
		"	transition: opacity 0.2s ease;",
		"	text-decoration: none;",
		"	color: var(--link-color);",
		"	font-size: 0.6em;",
		"	line-height: 1;",
		"	vertical-align: middle;",
		"}",
		"",
		"#content h1:hover .anchor-link,",
		"#content h2:hover .anchor-link,",
		"#content h3:hover .anchor-link,",
		"#content h4:hover .anchor-link,",
		"#content h5:hover .anchor-link,",
		"#content h6:hover .anchor-link {",
		"	opacity: 1;",
		"}",
		"",
		".anchor-link:hover {",
		"	text-decoration: underline;",
		"}",
		"",
		"@media (max-width: 760px) {",
		"	.anchor-link {",
		"		opacity: 1;",
		"	}",
		"}",
	].join("\n");

	function injectStyles() {
		if (document.getElementById(STYLE_ID)) return;
		var style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = CSS_TEXT;
		document.head.appendChild(style);
	}

	function loadFontAwesome() {
		if (document.querySelector("link[href*='font-awesome']")) return;
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = LINK_ICON_CDN;
		document.head.appendChild(link);
	}

	// Converts heading text to a URL-safe slug
	function slugify(text) {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function copyToClipboard(text, link) {
		navigator.clipboard.writeText(text).then(function () {
			var originalContent = link.innerHTML;
			link.textContent = "copied";
			link.style.fontSize = "0.65em";
			setTimeout(function () {
				link.innerHTML = originalContent;
				link.style.fontSize = "";
			}, 1500);
		}).catch(function (err) {
			console.error("Failed to copy:", err);
		});
	}

	function processHeadings() {
		var content = document.getElementById("content");
		if (!content) return;

		var headings = content.querySelectorAll("h1, h2, h3, h4, h5, h6");

		headings.forEach(function (heading) {
			if (heading.hasAttribute(PROCESSED_ATTR)) return;

			var id = heading.getAttribute("id");
			if (!id) {
				id = slugify(heading.textContent);
				heading.setAttribute("id", id);
			}

			var link = document.createElement("a");
			link.className = "anchor-link";
			link.href = "#" + id;
			link.setAttribute("aria-label", "Copy link to " + heading.textContent);

			var icon = document.createElement("i");
			icon.className = "fas fa-link";
			link.appendChild(icon);

			link.addEventListener("click", function (e) {
				e.preventDefault();
				var url = window.location.href.split("#")[0] + "#" + id;
				copyToClipboard(url, link);
			});

			heading.appendChild(link);
			heading.setAttribute(PROCESSED_ATTR, "");
		});
	}

	function init() {
		loadFontAwesome();
		injectStyles();
		processHeadings();

		var target = document.getElementById("content") || document.body;
		var observer = new MutationObserver(function () {
			processHeadings();
		});
		observer.observe(target, { childList: true, subtree: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
