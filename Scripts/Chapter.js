"use strict";

var fk_test_image = new Image();

// Check if the disable option is activated
chrome.storage.local.get("fk-options", function(options) {
		options = options['fk-options'];
		if (options == null || !options.hasOwnProperty("disable") || !options.disable) {
			Chapter();
		}
	}
);

function Chapter() {

	$('img').on('load', function() {
		console.log($(this).attr("src"));
		console.log($(this).parent().parent("#divImage").length);
	});
}

function FK_PageResize(attribute, value) {

	$("#divImage p > img").each(function() {
		fk_test_image.src = $(this).attr("src");

		if (attribute == "maxPageWidth" && !IsDoublePage(fk_test_image)) {
			$(this).css("max-width", value);
		}
		if (attribute == "maxDoublePageWidth" && IsDoublePage(fk_test_image)) {
			$(this).css("max-width", value);
		}
		if (attribute == "minPageWidth" && !IsDoublePage(fk_test_image)) {
			$(this).css("min-width", value);
		}
		if (attribute == "minDoublePageWidth" && IsDoublePage(fk_test_image)) {
			$(this).css("min-width", value);
		}
	});
}

function IsDoublePage(img) {
	return (img.naturalWidth >= img.naturalHeight);
}