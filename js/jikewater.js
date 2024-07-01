"use strict";

function waterfall(e) {
	function n(t, e) {
		e = window.getComputedStyle(e);
		return parseFloat(e["margin" + t]) || 0
	}

	function t(t) {
		return t + "px"
	}

	function o(t) {
		return parseFloat(t.style.left)
	}

	function r(t) {
		return t.clientWidth
	}

	function l(t) {
		return parseFloat(t.style.top) + t.clientHeight + n("Bottom", t)
	}

	function i(t) {
		return o(t) + r(t) + n("Right", t)
	}

	function s(t) {
		t.sort(function(t, e) {
			return l(t) === l(e) ? o(e) - o(t) : l(e) - l(t)
		})
	}

	function u(t) {
		r(e) != g && (t.target.removeEventListener(t.type, arguments.callee), waterfall(e))
	}
	"string" == typeof e && (e = document.querySelector(e));
	var a = [].map.call(e.children, function(t) {
		return t.style.position = "absolute", t
	}),
		f = (e.style.position = "relative", []);
	a.length && (a[0].style.top = "0px", a[0].style.left = t(n("Left", a[0])), f.push(a[0]));
	for (var p = 1; p < a.length; p++) {
		var c = a[p - 1],
			y = a[p];
		if (!(i(c) + r(y) <= r(e))) break;
		y.style.top = c.style.top, y.style.left = t(i(c) + n("Left", y)), f.push(y)
	}
	for (; p < a.length; p++) {
		s(f);
		var y = a[p],
			d = f.pop();
		y.style.top = t(l(d) + n("Top", y)), y.style.left = t(o(d)), f.push(y)
	}
	s(f);
	var h = f[0],
		g = (e.style.height = t(l(h) + n("Bottom", h)), r(e));
	window.addEventListener ? window.addEventListener("resize", u) : document.body.onresize = u
}
