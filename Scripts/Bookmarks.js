"use strict";

$(document).ready(function () {

	// Guidelines Changes
	$("#rightside").insertBefore($("#leftside"));
	$("#leftside, #rightside, .rightBox").addClass("fk-noGuidelines");
	$("#rightside .barContent").addClass("fk-hide");
	$("#rightside .barTitle").addClass("fk-guidelinesTitle");

	$("#rightside .barTitle").click(function() {
		$("#rightside .barContent").toggleClass("fk-hide");
	});

	/*var mangas = {};
	$(".listing tr:not(:first-child)").each(function() {
		var m = {
			name: $(this).find("td:eq(0) a").text()
		};
		mangas[$(this).find("td:eq(3) a").attr("mid")] = m;
		console.log(mangas);
	});*/
});