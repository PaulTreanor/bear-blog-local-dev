/**
 * rough-notation.js
 *
 * Draws a hand-drawn underline under every h1-h6 heading on the page using
 * RoughNotation (https://roughnotation.com), fitting the Excalidraw look.
 * Each annotation animates in once, when its heading scrolls into view.
 */
(function () {
	"use strict";

	var PROCESSED_ATTR = "data-rough-processed";

	function headingColor() {
		return getComputedStyle(document.documentElement)
			.getPropertyValue("--link-color")
			.trim();
	}

	function annotateHeading(heading) {
		if (heading.hasAttribute(PROCESSED_ATTR)) return;
		heading.setAttribute(PROCESSED_ATTR, "");

		var annotation = RoughNotation.annotate(heading, {
			type: "underline",
			color: headingColor(),
		});

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				annotation.show();
				observer.disconnect();
			});
		}, { threshold: 0.5 });

		observer.observe(heading);
	}

	function processHeadings() {
		document
			.querySelectorAll("h1, h2, h3, h4, h5, h6")
			.forEach(annotateHeading);
	}

	function init() {
		processHeadings();

		var observer = new MutationObserver(function () {
			processHeadings();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
