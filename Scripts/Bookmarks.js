"use strict";

function BookmarksPage() {
	if (Options.get("bookmarksSorting") == true) {
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
					<span id="fk-nbMangasDisplay" class="fk-hide"><span id="fk-nbMangas"></span> Mangas</span>\
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

		if (Options.get("enhancedDisplay") == false) {
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
		}

		$(table).find("#fk-menuUnread").click(function() {
			if (!$(this).hasClass("selected"))
			{
				$("#fk-bookmarksNavigation div").removeClass("fk-selected");
				$(this).addClass("fk-selected");
				$("#fk-bookmarks table").addClass("fk-hide");
				$("#fk-unread").removeClass("fk-hide");
				$("#fk-nbMangas").text($("#fk-unread tbody tr").length);
			}
		});
		$(table).find("#fk-menuReading").click(function() {
			if (!$(this).hasClass("selected"))
			{
				$("#fk-bookmarksNavigation div").removeClass("fk-selected");
				$(this).addClass("fk-selected");
				$("#fk-bookmarks table").addClass("fk-hide");
				$("#fk-reading").removeClass("fk-hide");
				$("#fk-nbMangas").text($("#fk-reading tbody tr").length);
			}
		});
		$(table).find("#fk-menuOnHold").click(function() {
			if (!$(this).hasClass("selected"))
			{
				$("#fk-bookmarksNavigation div").removeClass("fk-selected");
				$(this).addClass("fk-selected");
				$("#fk-bookmarks table").addClass("fk-hide");
				$("#fk-onHold").removeClass("fk-hide");
				$("#fk-nbMangas").text($("#fk-onHold tbody tr").length);
			}
		});
		$(table).find("#fk-menuCompleted").click(function() {
			if (!$(this).hasClass("selected"))
			{
				$("#fk-bookmarksNavigation div").removeClass("fk-selected");
				$(this).addClass("fk-selected");
				$("#fk-bookmarks table").addClass("fk-hide");
				$("#fk-completed").removeClass("fk-hide");
				$("#fk-nbMangas").text($("#fk-completed tbody tr").length);
			}
		});
	}

	var onHold_img_path = chrome.extension.getURL("Images/Notifications/OnHold.png");
	var notOnHold_img_path = chrome.extension.getURL("Images/Notifications/NotOnHold.png");
	var bookmarksObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (Options.get("bookmarksSorting") == true) {
				if (!injected && mutation.target.className == "listing") {
					injected = true;
					$(mutation.target).before(table);
					$(mutation.target).addClass("fk-hide");
				}
				if (mutation.target.tagName == "TR" && $(mutation.target).parent().parent().hasClass("listing") && mutation.target.className != "head") {
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
			}
			if (Options.get("enhancedDisplay") == true) {
				if (mutation.target.tagName == "TR" && !mutation.target.className.includes("fk-bookmarkRow")) {
					if (mutation.target.className != "head") {
						var infos = $(mutation.target).find("td[title]");
						var node = $($(infos).attr("title"));
						$(infos).prepend('<a class="fk-bookmarkTitle-imgLink" href="' + infos.find("a").attr("href") + '"><img src="' + $(node[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
						$(mutation.target).addClass("fk-bookmarkRow");
						$(mutation.target).find("td:nth-child(1)").addClass("fk-bookmarkTitle");
						$(mutation.target).find("td:nth-child(2)").addClass("fk-bookmarkChapter");
						$(mutation.target).find("td:nth-child(3), td:nth-child(4)").addClass("fk-bookmarkStatus");
						// Remove the text beside the icons
						$(mutation.target).find(".fk-bookmarkStatus a").each(function() {
							$(this).html($(this).find("img"));
						});
						if (Options.get("bookmarksSorting") == true) {
							$(mutation.target).find("td:nth-child(3)").after('\
								<td class="fk-bookmarkStatus">\
									<a mid="' + $(mutation.target).find("td:nth-child(4) a").attr("mid") + '" class="fk-notOnHold" href="#" onClick="return false;" title="Click to change to OnHold">\
										<img border="0" style="width:16px" src="' + notOnHold_img_path + '">\
									</a>\
									<a mid="' + $(mutation.target).find("td:nth-child(4) a").attr("mid") + '" class="fk-onHold fk-hide" href="#" onClick="return false;" title="Click to remove OnHold status">\
										<img border="0" style="width:16px" src="' + onHold_img_path + '">\
									</a>\
								</td>\
							');
							$(mutation.target).find("td:nth-child(4) a").click(function() {
								$(this).toggleClass("fk-hide");
								$(this).siblings().toggleClass("fk-hide");
							});
						}
					} else if (Options.get("bookmarksSorting") == false) {
						$(mutation.target).before('<tr class="head fk-bookmarkHeader"><th colspan="4">New Chapters</th></tr>');
						$(mutation.target).remove();
					}
				}
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

	$(document).ready(function () {

		if (Options.get("enhancedDisplay") == true) {
			// Guidelines Changes
			$("#rightside").insertBefore($("#leftside"));
			$("#leftside, #rightside, .rightBox").addClass("fk-noGuidelines");
			$("#rightside .barContent").addClass("fk-hide");
			$("#rightside .barTitle").addClass("fk-guidelinesTitle");

			$("#rightside .barTitle").click(function() {
				$("#rightside .barContent").toggleClass("fk-hide");
			});

			if (Options.get("bookmarksSorting") == false) {
				// "Read" header is added here, because it breaks the CSS when added during the mutations.
				$(".fk-bookmarkRow").each(function() {

					// Add the "Read" title
					if ($(this).find(".aRead").is(":visible")) {
						var prevNode = $(this).prev(".fk-bookmarkRow");
						if (prevNode != null && prevNode.find(".aUnRead").is(":visible")) {
							prevNode.after('<tr class="head fk-bookmarkHeader"><th colspan="4">Read</th></tr>');
						}
					}

				});
			}
		}
		if (Options.get("bookmarksSorting") == true) {
			$("#fk-nbMangasDisplay").removeClass("fk-hide");
			$("#fk-nbMangas").text($("#fk-unread tbody tr").length);
		}
	});
}

Options.init(BookmarksPage);