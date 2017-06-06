"use strict";

function Menu() {

	$(document).ready(function () {

		// Make username directly lead to bookmarks
		$("#aDropDown").attr("href", "http://kissmanga.com/BookmarkList");

	});	

}

FreeKiss.init(Menu);
