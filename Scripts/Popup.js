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
			$(this).next().text($(this).val());
			options[$(this).attr("name")] = $(this).val();
			chrome.storage.local.set({"fk-options": options});
		});

		$("#disable").click(function() {
			$(this).toggleClass("active");
			if ((options.disable = $(this).hasClass("active"))) {
				$(this).text("Enable FreeKiss");
			} else {
				$(this).text("Disable FreeKiss");
			}
			chrome.storage.local.set({"fk-options": options});
		});
	});

});
