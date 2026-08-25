/**
 * tufte-sidenotes.js
 *
 * Converts markdown footnotes (as rendered by the `marked-footnote` marked
 * extension) into Tufte CSS style sidenotes/margin notes.
 *
 * It does NOT require removing the marked-footnote <script> tag or the
 * `marked.use(markedFootnote())` call. Instead it watches the DOM for the
 * footnote markup that extension produces and rewrites it in place, after
 * the markdown has been rendered.
 *
 * marked-footnote (with default options) renders:
 *
 *   <sup><a id="footnote-ref-1" href="#footnote-1" data-footnote-ref
 *       aria-describedby="footnote-label">1</a></sup>
 *
 *   <section class="footnotes" data-footnotes>
 *     <h2 id="footnote-label" class="sr-only">Footnotes</h2>
 *     <ol>
 *       <li id="footnote-1">
 *         <p>Footnote text.</p>
 *         <a href="#footnote-ref-1" data-footnote-backref
 *             aria-label="Back to reference 1">↩</a>
 *       </li>
 *     </ol>
 *   </section>
 *
 * This script rewrites each `<sup><a data-footnote-ref>...</a></sup>` into
 * the Tufte CSS sidenote pattern (label + checkbox + span.sidenote) placed
 * inline where the reference was, using the matching <li> as the sidenote's
 * content, then hides the original footnotes section at the bottom of the
 * page.
 *
 * See https://edwardtufte.github.io/tufte-css/#sidenotes for the technique
 * this is based on.
 */
(function () {
	"use strict";

	var STYLE_ID = "tufte-sidenotes-styles";
	var PROCESSED_ATTR = "data-tufte-processed";
	var uidCounter = 0;

	var CSS_TEXT = [
		"body.has-tufte-sidenotes {",
		"	width: 87.5%;",
		"	max-width: 1400px;",
		"}",
		"",
		"body.has-tufte-sidenotes > header,",
		"body.has-tufte-sidenotes > footer,",
		"body.has-tufte-sidenotes > main,",
		"body.has-tufte-sidenotes .post-meta,",
		"body.has-tufte-sidenotes .tags {",
		"	width: 55%;",
		"	max-width: 720px;",
		"}",
		"",
		"body.has-tufte-sidenotes main {",
		"	counter-reset: sidenote-counter;",
		"}",
		"",
		"label.margin-toggle.sidenote-number {",
		"	counter-increment: sidenote-counter;",
		"	cursor: pointer;",
		"}",
		"",
		"label.margin-toggle.sidenote-number::after {",
		"	content: counter(sidenote-counter);",
		"	font-size: 0.7em;",
		"	vertical-align: super;",
		"	line-height: 1;",
		"	margin-left: 1px;",
		"	color: var(--link-color);",
		"}",
		"",
		"input.margin-toggle {",
		"	display: none;",
		"}",
		"",
		"label.margin-toggle:not(.sidenote-number) {",
		"	display: none;",
		"}",
		"",
		".sidenote {",
		"	float: right;",
		"	clear: right;",
		"	position: relative;",
		"	width: 40%;",
		"	margin-right: -48%;",
		"	margin-top: 0.2rem;",
		"	margin-bottom: 0;",
		"	font-size: 0.85em;",
		"	line-height: 1.4;",
		"	color: var(--text-color);",
		"	vertical-align: baseline;",
		"}",
		"",
		".sidenote::before {",
		"	content: counter(sidenote-counter) ' ';",
		"	font-size: 0.8em;",
		"	vertical-align: super;",
		"	line-height: 1;",
		"	color: var(--link-color);",
		"}",
		"",
		"section[data-footnotes].tufte-processed {",
		"	display: none !important;",
		"}",
		"",
		"@media (max-width: 760px) {",
		"	body.has-tufte-sidenotes {",
		"		width: auto;",
		"		max-width: var(--width);",
		"	}",
		"",
		"	body.has-tufte-sidenotes > header,",
		"	body.has-tufte-sidenotes > footer,",
		"	body.has-tufte-sidenotes > main,",
		"	body.has-tufte-sidenotes .post-meta,",
		"	body.has-tufte-sidenotes .tags {",
		"		width: auto;",
		"		max-width: none;",
		"	}",
		"",
		"	label.margin-toggle:not(.sidenote-number) {",
		"		display: inline;",
		"	}",
		"",
		"	.sidenote {",
		"		display: none;",
		"	}",
		"",
		"	.margin-toggle:checked + .sidenote {",
		"		display: block;",
		"		float: none;",
		"		clear: both;",
		"		width: 90%;",
		"		margin: 0.5rem auto 1rem;",
		"		padding: 0.5rem 0.75rem;",
		"		background: var(--code-background-color);",
		"		border-radius: 3px;",
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

	// Pulls the renderable content out of a footnote <li>, dropping its
	// backref link and unwrapping a lone <p> so it reads as inline text
	// inside the sidenote <span>.
	function extractNoteContent(li) {
		var clone = li.cloneNode(true);
		clone.removeAttribute("id");

		var backrefs = clone.querySelectorAll("[data-footnote-backref]");
		for (var i = 0; i < backrefs.length; i++) {
			backrefs[i].remove();
		}

		var frag = document.createDocumentFragment();
		var children = Array.prototype.slice.call(clone.childNodes);

		children.forEach(function (child) {
			var isBlankText = child.nodeType === Node.TEXT_NODE && !child.textContent.trim();
			if (isBlankText) return;

			var isLoneParagraph =
				child.nodeType === Node.ELEMENT_NODE &&
				child.tagName === "P" &&
				!child.nextElementSibling;

			if (isLoneParagraph) {
				while (child.firstChild) frag.appendChild(child.firstChild);
			} else {
				frag.appendChild(child);
			}
		});

		return frag;
	}

	function convertFootnotes(root) {
		root = root || document;

		var footnoteSection = root.querySelector("section[data-footnotes]");
		if (!footnoteSection || footnoteSection.hasAttribute(PROCESSED_ATTR)) return;

		console.log("Is this running")

		var refs = root.querySelectorAll(
			"a[data-footnote-ref]:not([" + PROCESSED_ATTR + "])"
		);
		if (!refs.length) return;

		var convertedCount = 0;

		refs.forEach(function (refLink) {
			var href = refLink.getAttribute("href") || "";
			var targetId = decodeURIComponent(href.replace(/^#/, ""));
			var note = targetId && footnoteSection.querySelector("#" + CSS.escape(targetId));
			if (!note) return;

			uidCounter += 1;
			var uid = "tufte-sn-" + uidCounter;

			var label = document.createElement("label");
			label.setAttribute("for", uid);
			label.className = "margin-toggle sidenote-number";

			var input = document.createElement("input");
			input.type = "checkbox";
			input.id = uid;
			input.className = "margin-toggle";

			var span = document.createElement("span");
			span.className = "sidenote";
			span.appendChild(extractNoteContent(note));

			var sup = refLink.closest("sup") || refLink;
			var parent = sup.parentNode;
			parent.insertBefore(label, sup);
			parent.insertBefore(input, sup);
			parent.insertBefore(span, sup);
			parent.removeChild(sup);

			convertedCount += 1;
		});

		footnoteSection.setAttribute(PROCESSED_ATTR, "");
		footnoteSection.classList.add("tufte-processed");

		if (convertedCount > 0) {
			document.body.classList.add("has-tufte-sidenotes");
		}
	}

	function init() {
		injectStyles();
		convertFootnotes(document);

		var target = document.getElementById("content") || document.body;
		var observer = new MutationObserver(function () {
			convertFootnotes(document);
		});
		observer.observe(target, { childList: true, subtree: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
