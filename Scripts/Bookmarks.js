"use strict";

function BookmarksPage() {
	var table = $('\
		<div id="fk-bookmarks">\
			<div id="fk-bookmarksNavigation">\
				<div id="fk-menuUnread" class="fk-selected">\
					Unread Chapters\
				</div>\
				<div id="fk-menuReading">\
					Reading\
				</div>\
				<div id="fk-menuOnHold">\
					On Hold\
				</div>\
				<div id="fk-menuCompleted">\
					Completed\
				</div>\
			</div>\
			<table id="fk-unread">\
				<tbody>\
				</tbody>\
			</table>\
			<table id="fk-reading" class="fk-hide">\
				<tbody>\
				</tbody>\
			</table>\
			<table id="fk-onHold" class="fk-hide">\
				<tbody>\
				</tbody>\
			</table>\
			<table id="fk-completed" class="fk-hide">\
				<tbody>\
				</tbody>\
			</table>\
		</div>\
	');
	var tUnreadChapter = $(table).find("#fk-unread tbody");
	var tReading = $(table).find("#fk-reading tbody");
	var tOnHold = $(table).find("#fk-onHold tbody");
	var tCompleted = $(table).find("#fk-completed tbody");
	var injected = false;

	$(table).addClass("fk-notEnhanced");
	$(table).find("table").prepend('\
		<thead>\
			<tr>\
				<th width="40%">\
					Manga Name\
				</th>\
				<th width="34%">\
					Latest Chapter\
				</th>\
				<th width="13%">\
					Status\
				</th>\
				<th width="13%">\
				</th>\
			</tr>\
		</thead>\
	');
	$(table).find("#fk-menuUnread").click(function() {
		if (!$(this).hasClass("selected"))
		{
			$("#fk-bookmarksNavigation div").removeClass("fk-selected");
			$(this).addClass("fk-selected");
			$("#fk-bookmarks table").addClass("fk-hide");
			$("#fk-unread").removeClass("fk-hide");
		}
	});
	$(table).find("#fk-menuReading").click(function() {
		if (!$(this).hasClass("selected"))
		{
			$("#fk-bookmarksNavigation div").removeClass("fk-selected");
			$(this).addClass("fk-selected");
			$("#fk-bookmarks table").addClass("fk-hide");
			$("#fk-reading").removeClass("fk-hide");
		}
	});
	$(table).find("#fk-menuOnHold").click(function() {
		if (!$(this).hasClass("selected"))
		{
			$("#fk-bookmarksNavigation div").removeClass("fk-selected");
			$(this).addClass("fk-selected");
			$("#fk-bookmarks table").addClass("fk-hide");
			$("#fk-onHold").removeClass("fk-hide");
		}
	});
	$(table).find("#fk-menuCompleted").click(function() {
		if (!$(this).hasClass("selected"))
		{
			$("#fk-bookmarksNavigation div").removeClass("fk-selected");
			$(this).addClass("fk-selected");
			$("#fk-bookmarks table").addClass("fk-hide");
			$("#fk-completed").removeClass("fk-hide");
		}
	});


	var bookmarksObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (!injected && mutation.target.className == "listing") {
				injected = true;
				$(mutation.target).before(table);
				$(mutation.target).remove();
			}
			if (mutation.target.tagName == "TR" && $(mutation.target).parent().parent().hasClass("listing") && mutation.target.className != "head") {
				console.log();
				if ($(mutation.target).find(".aRead").css('display') == 'none') {
					$(mutation.target).appendTo($(tUnreadChapter));
				} else if ($(mutation.target).find("td:nth-child(2) a").length == 0) {
					$(mutation.target).appendTo($(tCompleted));
				} else {
					$(mutation.target).appendTo($(tReading));
				}
			}
			if (mutation.target.tagName == "SCRIPT" && $(mutation.target).html().includes(".listing td[title]")) {
				$(mutation.target).html($(mutation.target).html().replace(/.listing td\[title\]/g, "td[title]"));
			}
		});
	});
	bookmarksObserver.observe(document,
		{
			attributes: false,
			attributeOldValue: false,
			childList: true,
			characterData: false,
			subtree: true
		}
	);

	// If the custom display is disabled, we do nothing
	if (Options.get("enhancedDisplay") == false) return;

	// The data of the images is processed by JQuery Tooltip and removed. So we need to get them before it happens using mutations.
	var titleObserver = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
	  	if (mutation.oldValue != null && $(mutation.oldValue).length == 3) {
	  		var node = $(mutation.oldValue);
	  		$(mutation.target).prepend('<a class="fk-bookmarkTitle-imgLink" href="' + node.find("a").attr("href") + '"><img src="' + $(node[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
	  	}
	  });
	});
	titleObserver.observe(document,
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