import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { gsap } from "gsap";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};


export const formatPrice = (price: bigint | undefined | null) => {
	//   <!-- ₹ -->
	return price ? `INR₹ ${Number(price) / 100}` : "N/A";
}

// @ts-ignore
export function horizontalLoop(items, config) {
	/*
	This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.
	
	Features:
	- Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
	- When each item animates to the left or right enough, it will loop back to the other side
	- Optionally pass in a config object with values like "speed" (default: 1, which travels at roughly 100 pixels per second), paused (boolean),  repeat, reversed, and paddingRight.
	- The returned timeline will have the following methods added to it:
	- next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
	- previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
	- toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
	- current() - returns the current index (if an animation is in-progress, it reflects the final index)
	- times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
	*/
	// @ts-ignore
	items = gsap.utils.toArray(items);
	config = config || {};
	// @ts-ignore
	let tl = gsap.timeline({
		repeat: config.repeat,
		paused: config.paused,
		defaults: { ease: "none" },
		// @ts-ignore
		onReverseComplete: () => { tl.totalTime(tl.rawTime() + tl.duration() * 100); },
	}),
		length = items.length,
		startX = items[0]?.offsetLeft,
		// @ts-ignore
		times = [],
		// @ts-ignore
		widths = [],
		// @ts-ignore
		xPercents = [],
		curIndex = 0,
		pixelsPerSecond = (config.speed || 1) * 100,
		// @ts-ignore
		snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
		totalWidth,
		curX,
		distanceToStart,
		distanceToLoop,
		item,
		i;
	// @ts-ignore
	gsap.set(items, {
		// convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
		// @ts-ignore
		xPercent: (i, el) => {
			// @ts-ignore
			let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
			xPercents[i] = snap(
				// @ts-ignore
				(parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
				// @ts-ignore
				gsap.getProperty(el, "xPercent")
			);
			return xPercents[i];
		},
	});
	// @ts-ignore
	gsap.set(items, { x: 0 });
	totalWidth =
		items[length - 1]?.offsetLeft +
		// @ts-ignore
		(xPercents[length - 1] / 100) * widths[length - 1] -
		startX +
		items[length - 1]?.offsetWidth *
		// @ts-ignore
		gsap.getProperty(items[length - 1], "scaleX") +
		(parseFloat(config.paddingRight) || 0);
	for (i = 0; i < length; i++) {
		item = items[i];
		// @ts-ignore
		curX = (xPercents[i] / 100) * widths[i];
		distanceToStart = item?.offsetLeft + curX - startX;
		distanceToLoop =
			// @ts-ignore
			distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
		tl.to(
			item,
			{
				// @ts-ignore
				xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
				duration: distanceToLoop / pixelsPerSecond,
			},
			0
		)
			.fromTo(
				item,
				{
					xPercent: snap(
						// @ts-ignore
						((curX - distanceToLoop + totalWidth) / widths[i]) * 100
					),
				},
				{
					// @ts-ignore
					xPercent: xPercents[i],
					duration:
						(curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
					immediateRender: false,
				},
				distanceToLoop / pixelsPerSecond
			)
			.add("label" + i, distanceToStart / pixelsPerSecond);
		times[i] = distanceToStart / pixelsPerSecond;
	}
	// @ts-ignore
	function toIndex(index, vars) {
		vars = vars || {};
		Math.abs(index - curIndex) > length / 2 &&
			(index += index > curIndex ? -length : length); // always go in the shortest direction
		// @ts-ignore
		let newIndex = gsap.utils.wrap(0, length, index),
			// @ts-ignore
			time = times[newIndex];
		if (time > tl.time() !== index > curIndex) {
			// if we're wrapping the timeline's playhead, make the proper adjustments
			// @ts-ignore
			vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
			time += tl.duration() * (index > curIndex ? 1 : -1);
		}
		curIndex = newIndex;
		vars.overwrite = true;
		return tl.tweenTo(time, vars);
	}
	// @ts-ignore
	tl.next = (vars) => toIndex(curIndex + 1, vars);
	// @ts-ignore
	tl.previous = (vars) => toIndex(curIndex - 1, vars);
	tl.current = () => curIndex;
	// @ts-ignore
	tl.toIndex = (index, vars) => toIndex(index, vars);
	tl.times = times;
	tl.progress(1, true).progress(0, true); // pre-render for performance
	if (config.reversed) {	
		// @ts-ignore
		tl.vars.onReverseComplete();
		tl.reverse();
	}
	return tl;
}
