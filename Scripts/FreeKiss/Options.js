"use strict";

function Init() {
	$(document).ready(function() {
		$("input[type='checkbox']").each(function() {
			$(this).prop("checked", FreeKiss.Options.get($(this).attr("name")));
		});

		$("input[type='checkbox']").change(function() {
			FreeKiss.Options.set($(this).attr("name"), $(this).prop("checked"));
			FreeKiss.Options.save();
		});
	});
}

FreeKiss.init(Init, false);