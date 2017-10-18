"use strict";

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

function AddSortingTable(table, name, idName, selected = false) {
	let navigation = $('<div id="fk-menu' + idName.capitalize() + '">' + name + '</div>');
	if (selected) {
		$(navigation).addClass("fk-selected");
	}
	// Link the tab to the navigation menu
	$(navigation).click(function() {
		if (!$(this).hasClass("selected"))
		{
			$("#fk-bookmarksNavigation div").removeClass("fk-selected");
			$(this).addClass("fk-selected");
			$("#fk-bookmarks table").addClass("fk-hide");
			$("#fk-" + idName).removeClass("fk-hide");
			$("#fk-nbMangas").text($("#fk-" + idName + " tbody tr").length);
		}
	});
	$(table).find("#fk-bookmarksNavigation #fk-nbMangasDisplay").before(navigation);
	let content = $('<table id="fk-' + idName + '"><tbody></tbody></table>');
	if (!selected) {
		$(content).addClass("fk-hide");
	}

	// If the EnhacedDisplayed option is disabled, we recreate KissManga basic layout in the tabs
	if (FreeKiss.Options.get("enhancedDisplay") == false) {
		$(content).prepend('\
			<thead>\
				<tr>\
					<th width="40%">\
						Manga Name\
					</th>\
					<th width="33%">\
						Latest Chapter\
					</th>\
					<th width="10%">\
						Status\
					</th>\
					<th width="4%">\
					</th>\
					<th width="13%">\
					</th>\
				</tr>\
			</thead>\
		');
	}
	$(table).append(content);
	return $(content).find("tbody");
}

function BookmarksPage() {
	// If the BookmarksSorting option is enabled
	if (FreeKiss.Options.get("bookmarksSorting") == true) {
		// Creation of the different tabs
		var table = $('\
			<div id="fk-bookmarks">\
				<div id="fk-bookmarksNavigation">\
					<span id="fk-nbMangasDisplay" class="fk-hide"><span id="fk-nbMangas"></span> Mangas</span>\
				</div>\
			</div>\
		');
		// References
		var tUnreadChapter = AddSortingTable(table, "Unread Chapters", "unread", true);
		var tReading = AddSortingTable(table, "Reading", "reading");
		var tOnHold = AddSortingTable(table, "On Hold", "onHold");
		var tPlanToRead = AddSortingTable(table, "Plan To Read", "planToRead");
		var tCompleted = AddSortingTable(table, "Completed", "completed");
		var injected = false;

		// If the EnhacedDisplayed option is disabled, we recreate KissManga basic layout in the tabs
		if (FreeKiss.Options.get("enhancedDisplay") == false) {
			$(table).addClass("fk-notEnhanced");
		}
	}

	// Mutations. Will take the bookmarks as they are added to the page to change and order them
	var bookmarksObserver = new MutationObserver(function(mutations) {
		// Scroll the mutations
		mutations.forEach(function(mutation) {
			// BookmarkSorting option
			if (FreeKiss.Options.get("bookmarksSorting") == true) {
				// Add the tabs in the page and hide KissManga table
				if (!injected && mutation.target.className == "listing") {
					injected = true;
					$(mutation.target).before(table);
					$(mutation.target).addClass("fk-hide");
				}
				// Sort the bookmarks
				if (mutation.target.tagName == "TR" && $(mutation.target).parent().parent().hasClass("listing") && mutation.target.className != "head") {
					let status = FreeKiss.Status.get($(mutation.target).find("td:nth-child(4) a").attr("mid"));
					if (status == Mangas.Status.ON_HOLD) {
						$(mutation.target).appendTo($(tOnHold));
					} else if (status == Mangas.Status.PLAN_TO_READ) {
						$(mutation.target).appendTo($(tPlanToRead));
					} else if ($(mutation.target).find(".aRead").css('display') == 'none') {
						$(mutation.target).appendTo($(tUnreadChapter));
					} else if ($(mutation.target).find("td:nth-child(2) a").length == 0) {
						$(mutation.target).appendTo($(tCompleted));
					} else {
						$(mutation.target).appendTo($(tReading));
					}
					// If enhancedDisplay is disabled, we add the OnHold status here
					if (FreeKiss.Options.get("enhancedDisplay") == false) {
						AddOnHoldStatus($(mutation.target), false);
					}
				}
				// Update the Tooltip script present in the page. The include is important to avoid infinite looping
				if (mutation.target.tagName == "SCRIPT" && $(mutation.target).html().includes(".listing td[title]")) {
					$(mutation.target).html($(mutation.target).html().replace(/.listing td\[title\]/g, "td[title]"));
				}
			}

			// EnhancedDisplay option
			if (FreeKiss.Options.get("enhancedDisplay") == true) {
				if (mutation.target.tagName == "TR" && !mutation.target.className.includes("fk-bookmarkRow")) {
					if (mutation.target.className != "head") {
						// Recuperation of the image from the tooltip and add it to the bookmarks
						var infos = $(mutation.target).find("td[title]");
						var node = $($(infos).attr("title"));
						$(infos).prepend('<a class="fk-bookmarkTitle-imgLink" href="' + infos.find("a").attr("href") + '"><img src="' + $(node[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
						
						// Add our own class
						$(mutation.target).addClass("fk-bookmarkRow");
						$(mutation.target).find("td:nth-child(1)").addClass("fk-bookmarkTitle");
						$(mutation.target).find("td:nth-child(2)").addClass("fk-bookmarkChapter");
						$(mutation.target).find("td:nth-child(3), td:nth-child(4)").addClass("fk-bookmarkStatus");
						
						// Remove the text beside the icons
						$(mutation.target).find(".fk-bookmarkStatus a").each(function() {
							$(this).html($(this).find("img"));
						});

						// If BookmarkSorting is also enabled, we add the OnHold menu
						if (FreeKiss.Options.get("bookmarksSorting") == true) {
							AddOnHoldStatus($(mutation.target));
						}
					// If it's the header and BookmarkSorting is disabled, we remove it and add our own
					} else if (FreeKiss.Options.get("bookmarksSorting") == false) {
						$(mutation.target).before('<tr class="head fk-bookmarkHeader"><th colspan="4">New Chapters</th></tr>');
						$(mutation.target).remove();
					}
				}
			}
		});
	});
	// Mutation, I choose you !
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

		if (FreeKiss.Options.get("enhancedDisplay") == true) {
			// Guidelines Changes
			$("#rightside").insertBefore($("#leftside"));
			$("#leftside, #rightside, .rightBox").addClass("fk-noGuidelines");
			$("#rightside .barContent").addClass("fk-hide");
			$("#rightside .barTitle").addClass("fk-guidelinesTitle");

			$("#rightside .barTitle").click(function() {
				$("#rightside .barContent").toggleClass("fk-hide");
			});

			if (FreeKiss.Options.get("bookmarksSorting") == false) {
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
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			$("#fk-nbMangasDisplay").removeClass("fk-hide");
			$("#fk-nbMangas").text($("#fk-unread tbody tr").length);
		}
	});
}

// Recuperation of FreeKiss images path
var onHold_img_path = chrome.extension.getURL("Images/Status/OnHold.png");
var notOnHold_img_path = chrome.extension.getURL("Images/Status/Default.png");

// Create the OnHold status button after the read/unread button
// node is the bookmark DOM element
// withClass determines if "fk-bookmarkStatus" should be added to the element
function AddOnHoldStatus(node, withClass = true) {
	var mid = $(node).find("td:nth-child(4) a").attr("mid");
	var status = FreeKiss.Status.get(mid);
	$(node).find("td:nth-child(3)").after('\
		<td>\
			<a mid="' + mid + '" class="fk-notOnHold' + (status == Mangas.Status.ON_HOLD ? ' fk-hide' : '') + '" href="#" onClick="return false;" title="Click to change to OnHold">\
				<img border="0" style="width:16px" src="' + notOnHold_img_path + '">\
			</a>\
			<a mid="' + mid + '" class="fk-onHold' + (status != Mangas.Status.ON_HOLD ? ' fk-hide' : '') + '" href="#" onClick="return false;" title="Click to remove OnHold status">\
				<img border="0" style="width:16px" src="' + onHold_img_path + '">\
			</a>\
		</td>\
	');
	if (withClass) {
		$(node).find("td:nth-child(4)").addClass("fk-bookmarkStatus");
	}
	// OnHold click interaction
	$(node).find("td:nth-child(4) a").click(function() {
		if ($(this).hasClass("fk-notOnHold")) {
			FreeKiss.Status.set($(this).attr("mid"), Mangas.Status.ON_HOLD);
		} else {
			FreeKiss.Status.unset($(this).attr("mid"));
		}
		FreeKiss.Status.save();
		$(this).toggleClass("fk-hide");
		$(this).siblings().toggleClass("fk-hide");
	});
}

FreeKiss.init(BookmarksPage);