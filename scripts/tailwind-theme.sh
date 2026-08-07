#!/usr/bin/env bash
set -euo pipefail

mode="$1"
theme="${2:-}"

build_one() {
	local dir="$1"
	npx tailwindcss -i "$dir/input.css" -o "$dir/styles.css" --minify
}

case "$mode" in
	dev)
		if [ -z "$theme" ]; then
			echo "Usage: npm run dev -- <theme-folder>" >&2
			exit 1
		fi
		npx tailwindcss -i "$theme/input.css" -o "$theme/styles.css" --watch
		;;
	build)
		if [ -z "$theme" ]; then
			echo "Usage: npm run build -- <theme-folder>" >&2
			exit 1
		fi
		build_one "$theme"
		;;
	build-all)
		for dir in */; do
			dir="${dir%/}"
			if [ -f "$dir/input.css" ]; then
				echo "Building $dir..."
				build_one "$dir"
			fi
		done
		;;
	*)
		echo "Unknown mode: $mode" >&2
		exit 1
		;;
esac
