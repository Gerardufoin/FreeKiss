"use strict";

// String capitalize function
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

/*
* Create a new sorting table named "name" with "idName" as id and insert it into "table"
* @param {jQuery Node} table - The table which will contain the new sorting table
* @param {String} name - Name displayed on the tab of the new sorting table
* @param {String} idName - The id used to identify the table. Should start with a lowercase and without "fk-"
* @param {Boolean} selected - If set to true, the sorting table tab will be displayed as selected at page load. False by default.
*/
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
		var tCompvared = AddSortingTable(table, "Compvared", "compvared");

		// If the EnhacedDisplayed option is disabled, we recreate KissManga basic layout in the tabs
		if (FreeKiss.Options.get("enhancedDisplay") == false) {
			$(table).addClass("fk-notEnhanced");
		}
	} else {
		// If the sorting is disabled, we create a simple tab to transfer the bookmarks
		var table = $('<table class="listing"><tbody class="fk-ignore"></tbody></table>');
		var body = $(table).find('tbody');		
	}

	var injected = false;
	// Mutations. Will take the bookmarks as they are added to the page to change and order them
	new MutationObserver(function(mutations) {
		// Scroll the mutations
		mutations.forEach(function(mutation) {
			if (mutation.target.tagName == "TBODY" && !$(mutation.target).hasClass("fk-ignore")) {
				mutation.addedNodes.forEach(function(node) {
					if (node.tagName == "TR") {
						UpgradeBookmarkNode(node);
						$(body).append(node);
					}
				});
			}

			// Add the tabs in the page and hide KissManga table
			if (!injected && mutation.target.className == "listing") {
				injected = true;
				$(mutation.target).addClass("fk-hide");
				$(mutation.target).before(table);
			}

			// Update the Tooltip script present in the page. The .includes() is important to avoid infinite looping
			if (FreeKiss.Options.get("bookmarksSorting") == true && mutation.target.tagName == "SCRIPT" && $(mutation.target).html().includes(".listing td[title]")) {
				$(mutation.target).html($(mutation.target).html().replace(/.listing td\[title\]/g, "td[title]"));
			}
		});
	}).observe(document, {childList: true, subtree: true});

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
				// "Read" header is added here, in order to be certain that all the cells are fully loaded.
				$(".fk-bookmarkRow").each(function() {
					// Add the "Read" title
					if ($(this).find(".fk-bRead").is(":visible")) {
						let prevNode = $(this).prev(".fk-bookmarkRow");
						if (prevNode != null && prevNode.find(".fk-bUnRead").is(":visible")) {
							prevNode.after('<tr class="head fk-bookmarkHeader"><th colspan="3">Read</th></tr>');
						}
					}
				});
			}

			// I... I honestly don't know. Sometimes, the cells will not have the correct display and will break a line for no reason.
			// I have to trick the CSS into thinking it has to redisplay itself to correct the issue.
			// (To do that I change the display to "inline-table" which is the same as with "inline-block" so it's invisible, and then I switch back)
			// The mutations must be at fault somehow, but I have no clue why.
			// If someone stumbles upon this comment and has an idea, I'm curious to know.
			$(".fk-bookmarkRow").css("display", "inline-table");
			setTimeout(() => {
				$(".fk-bookmarkRow").css("display", "");
			}, 50);
		}
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			$("#fk-nbMangasDisplay").removeClass("fk-hide");
			$("#fk-nbMangas").text($("#fk-unread tbody tr").length);
		}
	});
}

/*
* Receive a bookmark node as parameter and apply the FreeKiss design modifications
* This function is called during the mutation when the table row is added in the page. As such, not all nodes may not be present at the time.
* @param {jQuery Node} node - The bookmark row
*/
function UpgradeBookmarkNode(node) {
	// If the node does not contain all the td, we place an observer on it and return
	if ($(node).children().length < 4) {
		new MutationObserver(function(mutations, observer) {
			// We don't care about the mutation content, we just want to know when all the 4 nodes are added
			if ($(node).children().length >= 4) {
				observer.disconnect();
				UpgradeBookmarkNode(node);
			}
		}).observe(node, {childList: true});
		return;
	}

	if ($(node).find("th").length > 0) {
		$(node).find("th:last-child").remove();
		$(node).find("th:last-child").attr("width", "26%");

		if (FreeKiss.Options.get("enhancedDisplay") == true) {
			$(node).html('<th colspan="3">New Chapters</th>');
			$(node).addClass("fk-bookmarkHeader");
		}
	} else {
		let mid = Bookmarks.updateBookmark(node);
		$(node).find("td:last-child").remove();
		$(node).find("td:last-child").empty();
		let link = $(node).find("td:first-child a");
		$(node).find("td:last-child").append(Management.CreateManager($(link).text(), $(link).attr("href").substring(1)));

		if (FreeKiss.Options.get("enhancedDisplay") == true) {
			// Recuperation of the image from the tooltip and add it to the bookmarks
			let title = $($(node).find("td[title]").attr("title"));
			$(node).find("td:first-child").prepend('<a class="fk-bookmarkTitle-imgLink" href="' + link + '"><img src="' + $(title[0]).attr("src") + '" class="fk-bookmarkImage" /></a>');
			
			// Add our own class
			$(node).addClass("fk-bookmarkRow");
			$(node).find("td:nth-child(1)").addClass("fk-bookmarkTitle");
			$(node).find("td:nth-child(2)").addClass("fk-bookmarkChapter");
			$(node).find("td:nth-child(3)").addClass("fk-bookmarkStatus");
		}

		/*// Sort the bookmarks if sorting is enabled
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			var status = FreeKiss.Status.get($(mutation.target).find("td:nth-child(4) a").attr("mid"));
			if (status == Mangas.Status.ON_HOLD) {
				$(mutation.target).appendTo($(tOnHold));
			} else if (status == Mangas.Status.PLAN_TO_READ) {
				$(mutation.target).appendTo($(tPlanToRead));
			} else if ($(mutation.target).find(".aRead").css('display') == 'none') {
				$(mutation.target).appendTo($(tUnreadChapter));
			} else if ($(mutation.target).find("td:nth-child(2) a").length == 0) {
				$(mutation.target).appendTo($(tCompvared));
			} else {
				$(mutation.target).appendTo($(tReading));
			}
			// If enhancedDisplay is disabled, we add the OnHold status here
			if (FreeKiss.Options.get("enhancedDisplay") == false) {
				AddOnHoldStatus($(mutation.target), false);
			}
		}*/
	}
}

FreeKiss.init(BookmarksPage);