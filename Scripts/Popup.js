"use strict";

$(document).ready(function() {

	//chrome.storage.local.remove("fk-options");
	chrome.storage.local.get("fk-options", function(options) {
		options = options['fk-options'];
		if (options == null) {
			options = {};
		}

		if (!options.hasOwnProperty("maxPageWidth")) options.maxPageWidth = 1800;
		if (!options.hasOwnProperty("maxDoublePageWidth")) options.maxDoublePageWidth = 1800;
		if (!options.hasOwnProperty("minPageWidth")) options.minPageWidth = 1800;
		if (!options.hasOwnProperty("minDoublePageWidth")) options.minDoublePageWidth = 1800;
		if (options.hasOwnProperty("disable") && options.disable)
		{
			$("#disable").addClass("active").text("Enable FreeKiss");
		}

		$(".slider[name=maxPageWidth]").val(options.maxPageWidth).next().text(options.maxPageWidth);
		$(".slider[name=maxDoublePageWidth]").val(options.maxDoublePageWidth).next().text(options.maxDoublePageWidth);
		$(".slider[name=minPageWidth]").val(options.minPageWidth).next().text(options.minPageWidth);
		$(".slider[name=minDoublePageWidth]").val(options.minDoublePageWidth).next().text(options.minDoublePageWidth);
		
		$(".slider").on("input", function() {
			var name = $(this).attr("name");
			var value = $(this).val();
			$(this).next().text(value);
			options[name] = value;
			chrome.storage.local.set({"fk-options": options});
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_PageResize === "function") FK_PageResize("' + name + '", ' + value + ');'
					});
				}
			});
		});

		$("#disable").click(function() {
			$(this).toggleClass("active");
			if ((options.disable = $(this).hasClass("active"))) {
				$(this).text("Enable FreeKiss");
			} else {
				$(this).text("Disable FreeKiss");
			}
			chrome.storage.local.set({"fk-options": options});
			chrome.tabs.query({url: "*://kissmanga.com/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.reload(tabs[i].id);
				}
			});
		});
	});

});
