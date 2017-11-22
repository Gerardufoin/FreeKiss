"use strict";

$(document).ready(function() {
	$("#showPreRelease").click(function() {
		$("#preRelease").toggleClass("fk-hide");
		if ($("#preRelease").hasClass("fk-hide")) {
			$(this).text("Show pre-release patchnotes");
		} else {
			$(this).text("Hide pre-release patchnotes");
		}
	});
});
