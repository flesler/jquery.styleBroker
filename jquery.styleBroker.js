/*!
 * jQuery.styleBroker
 * Copyright (c) 2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 1/8/2013
 * @projectDescription Minimizes both queries and modifications to DOM styles.
 * @author Ariel Flesler
 * @version 0.1.0
 */

//-- DISCLAIMER: This is a draft version with certain bugs and not production ready --//

;(function( $ ) {

	$.styleBroker = function( settings ) {
		if (settings.write) styleBuffer();	
		if (settings.read) styleCache();	
	};


	// jQuery.data seems like it would slow things down to much
	// I'll use a faster simplified version (for now)
	var caches = {};
	var counter = 0;
	var expando = '__expando__';

	function getUID(elem) {
		if (expando in elem === false) {
			elem[expando] = ++counter;
		}
		return elem[expando];
	};

	function getCache(elem) {
		var uid = getUID(elem);
		return caches[uid] || (caches[uid] = {});
	};

	
	function styleCache() {
		/*
		// TEMP test cache efficiency
		var cached = 0;
		var total = 0;
		setInterval(function() { console.info('cache efficiency:', cached, '/', total); }, 1000);
		*/

		var get = $.css;
		var set = $.style;

		$.css = function(elem, name) {
			//total++;
			var cache = getCache(elem);
			if (cache[name] !== undefined) {
				//cached++;
				return cache[name];
			}
			// Use apply(argument) as the amount of parameters have recently changed
			return cache[name] = get.apply(this, arguments);
		};

		$.style = function(elem, name, value, extra) {
			var cache = getCache(elem);
			var ret = set(elem, name, value, extra);
			// Setting undefined equals to getting the value
			if (value !== undefined) {
				cache[name] = value;
			} else if (ret !== undefined) {
				cache[name] = ret;
				//total++;
			}
			return ret;
		};
	};

	var requestAnimationFrame = window.requestAnimationFrame = 
		window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(fn) { setTimeout(fn, 16.7) };

	function styleBuffer() {
		var set = $.style;
		var buffer = null;

		function flush() {
			for (var key in buffer) {
				set.apply(this, buffer[key]);
			}

			buffer = null;
		};

		/*
		// TEMP test buffer efficiency
		var overriden = 0;
		var total = 0;
		setInterval(function() { console.info('buffer efficiency:', overriden, '/', total); }, 1000);
		*/
		
		$.style = function(elem, name, value, extra) {
			// Setting undefined equals to getting the value
			if (value === undefined) {
				return set(elem, name, value, extra);
			}

			//total++;
			if (!buffer) {
				buffer = {};
				requestAnimationFrame(flush);
			}

			var key = getUID(elem) + name;
			//if (buffer[key]) overriden++;
			buffer[key] = arguments;
		};
	};


})( jQuery );