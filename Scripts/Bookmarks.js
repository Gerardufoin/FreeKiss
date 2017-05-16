"use strict";

function BookmarksPage() {
	// If the custom display is disabled, we do nothing
	if (Options.get("enhancedDisplay") == false) return;

	// The data of the images is processed by JQuery Tooltip and removed. So we need to get them before it happens using mutations.
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
	  	if (mutation.oldValue != null && $(mutation.oldValue).length == 3) {
	  		var node = $(mutation.oldValue);
	  		$(mutation.target).prepend('<a class="fk-bookmarkTitle-imgLink" href="' + node.find("a").attr("href") + '"><img src="' + $(node[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
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
		}
	);

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
		$(".listing tbody").prepend('<tr class="head fk-bookmarkHeader"><th colspan="4">New Chapters</th></tr>');
		$(".listing tr:not(.fk-bookmarkHeader)").addClass("fk-bookmarkRow");
		$(".fk-bookmarkRow td:nth-child(1)").addClass("fk-bookmarkTitle");
		$(".fk-bookmarkRow td:nth-child(2)").addClass("fk-bookmarkChapter");
		$(".fk-bookmarkRow td:nth-child(3), .fk-bookmarkRow td:nth-child(4)").addClass("fk-bookmarkStatus");

		// Remove the text beside the icons
		$(".fk-bookmarkStatus a").each(function() {
			$(this).html($(this).find("img"));
		});

		// Loop through all bookmarks
		$(".fk-bookmarkRow").each(function() {

			// Add the "Read" title
			if ($(this).find(".aRead").is(":visible")) {
				var prevNode = $(this).prev(".fk-bookmarkRow");
				if (prevNode != null && prevNode.find(".aUnRead").is(":visible")) {
					prevNode.after('<tr class="head fk-bookmarkHeader"><th colspan="4">Read</th></tr>');
				}			
			}

		});
	});
}

Options.init(BookmarksPage);