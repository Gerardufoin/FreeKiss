"use strict";

function Init() {
	$(document).ready(function() {
		$("input[name='frontpageManager']").prop("checked", FreeKiss.Options.get("frontpageManager"));
		$("input[name='enhancedDisplay']").prop("checked", FreeKiss.Options.get("enhancedDisplay"));
		$("input[name='bookmarksSorting']").prop("checked", FreeKiss.Options.get("bookmarksSorting"));

		$("input[type='checkbox']").change(function() {
			FreeKiss.Options.set($(this).attr("name"), $(this).prop("checked"));
			FreeKiss.Options.save();
		});
	});
}

FreeKiss.init(Init, false);