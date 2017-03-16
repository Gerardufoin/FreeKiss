"use strict";

// The data of the images is processed by JQuery Tooltip and removed. So we need to get them before it happens using mutations.
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
  	if (mutation.oldValue != null && $(mutation.oldValue).length == 3) {
  		var node = $(mutation.oldValue);
  		$(mutation.target).prepend('<a href="' + node.find("a").attr("href") + '"><img src="' + $(node[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
  	}
  });    
});
observer.observe(document,
	{
		attributes: true,
		attributeOldValue: true,
		childList: false,
		characterData: false,
		subtree: true,
		attributeFilter: [ "title" ]
	});

$(document).ready(function () {

	// Guidelines Changes
	$("#rightside").insertBefore($("#leftside"));
	$("#leftside, #rightside, .rightBox").addClass("fk-noGuidelines");
	$("#rightside .barContent").addClass("fk-hide");
	$("#rightside .barTitle").addClass("fk-guidelinesTitle");

	$("#rightside .barTitle").click(function() {
		$("#rightside .barContent").toggleClass("fk-hide");
	});

	// Bookmarks layout
	$(".listing tr:first-child").remove();
	$(".listing tr").addClass("fk-bookmarkRow");
	$(".fk-bookmarkRow td:nth-child(1)").addClass("fk-bookmarkTitle");
	$(".fk-bookmarkRow td:nth-child(2)").addClass("fk-bookmarkChapter");
	$(".fk-bookmarkRow td:nth-child(3), .fk-bookmarkRow td:nth-child(4)").addClass("fk-bookmarkStatus");

	// Bookmarks infos
	var mangas = {};
	$(".listing tr:not(:first-child)").each(function() {
		var m = {
			name: $(this).find("td:eq(0) a").text()
		};
		mangas[$(this).find("td:eq(3) a").attr("mid")] = m;
		//console.log($(this).find("td:eq(0)"));
	});
});