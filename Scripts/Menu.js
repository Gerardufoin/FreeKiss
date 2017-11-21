"use strict";

/** Main function modifying KissManga user menu. Needs to be called after FreeKiss is loaded. */
function Menu() {

	$(document).ready(function () {

		// Make username directly lead to bookmarks
		$("#aDropDown").attr("href", "http://kissmanga.com/BookmarkList");

	});	

}

FreeKiss.init(Menu);
