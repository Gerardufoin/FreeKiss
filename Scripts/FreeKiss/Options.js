"use strict";

function Init() {
	$(document).ready(function() {
		$("input[name='frontpageManager']").prop("checked", Options.get("frontpageManager"));
		$("input[name='enhancedDisplay']").prop("checked", Options.get("enhancedDisplay"));

		$("input[type='checkbox']").change(function() {
			Options.set($(this).attr("name"), $(this).prop("checked"));
			Options.save();
		});
	});
}

Options.init(Init, false);