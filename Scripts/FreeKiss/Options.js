"use strict";

/** Main function, called after FreeKiss is loaded */
function Options() {
	$(document).ready(function() {
		// All the boolean options are formatted the same way for genericityù
		$("input[type='checkbox']").each(function() {
			$(this).prop("checked", FreeKiss.Options.get($(this).attr("name")));
		});

		$("input[type='checkbox']").change(function() {
			FreeKiss.Options.set($(this).attr("name"), $(this).prop("checked"));
			FreeKiss.Options.save();
		});
	});
}

FreeKiss.init(Options, false);