/**
 * reading-progress.js
 *
 * Adds a minimal reading progress bar fixed to the top of the page that
 * fills as the user scrolls down the content.
 */
(function () {
	"use strict";

	var STYLE_ID = "reading-progress-styles";
	var BAR_ID = "reading-progress-bar";

	var CSS_TEXT = [
		"#" + BAR_ID + " {",
		"	position: fixed;",
		"	top: 0;",
		"	left: 0;",
		"	height: 2px;",
		"	background: linear-gradient(90deg, var(--link-color), var(--visited-color));",
		"	width: 0%;",
		"	z-index: 999;",
		"	transition: width 0.1s ease-out;",
		"}",
	].join("\n");

	function injectStyles() {
		if (document.getElementById(STYLE_ID)) return;
		var style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = CSS_TEXT;
		document.head.appendChild(style);
	}

	function createProgressBar() {
		if (document.getElementById(BAR_ID)) return;
		var bar = document.createElement("div");
		bar.id = BAR_ID;
		document.body.insertBefore(bar, document.body.firstChild);
	}

	function updateProgress() {
		var bar = document.getElementById(BAR_ID);
		if (!bar) return;

		var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		if (scrollHeight <= 0) return;

		var scrolled = window.scrollY;
		var progress = (scrolled / scrollHeight) * 100;

		bar.style.width = progress + "%";
	}

	function init() {
		injectStyles();
		createProgressBar();

		window.addEventListener("scroll", updateProgress, { passive: true });
		window.addEventListener("resize", updateProgress, { passive: true });

		updateProgress();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
