"use strict";

$(document).ready(function () {

	// Bookmarks management
	chrome.storage.local.get("fk-bookmarks", function(bookmarks) {
		bookmarks = bookmarks['fk-bookmarks'];
		if (Object.keys(bookmarks).length == 0) return;

		var hrefs = [];
		for (var mid in bookmarks) {
			hrefs.push(bookmarks[mid].href);
		}

		var bookmark_img_path = chrome.extension.getURL("Images/Notifications/Bookmarked.png");
		$("div.scrollable .items a").each(function() {
			if ($.inArray($(this).attr("href"), hrefs) !== -1) {

				$(this).addClass("fk-scrollableItem");

				$(this).append('<img src="' + bookmark_img_path + '" class="fk-scrollableBookmarkNotification">');

			}
		});
	});
});
