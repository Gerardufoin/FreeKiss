"use strict";

// Check if the disable option is activated
chrome.storage.local.get("fk-options", function(options) {
		options = options['fk-options'];
		if (options == null || !options.hasOwnProperty("disable") || !options.disable) {
			FreeKiss();
		}
	}
);

function FreeKiss() {

	$(document).ready(function () {

		// Make username directly lead to bookmarks
		$("#aDropDown").attr("href", "http://kissmanga.com/BookmarkList");

	});	

}
