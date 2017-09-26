"use strict";

// Recuperation of FreeKiss images path
var onHold_img_path = chrome.extension.getURL("Images/Notifications/OnHold.png");
var notOnHold_img_path = chrome.extension.getURL("Images/Notifications/NotOnHold.png");

// Create the bookmark management node to be append into the DOM, store the name and url in the node for future use
function CreateBookmarkManagementNode(name, url) {
	var management = $('\
		<div class="fk-management">\
			<span class="fk-bookmarkManagement fk-hide">\
				<a class="fk-bRead fk-hide" title="Click to change status to \'Unread\'">\
					<img src="/Content/Images/include.png">\
				</a>\
				<a class="fk-bUnRead fk-hide" title="Click to change status to \'Read\'">\
					<img src="/Content/Images/notread.png">\
				</a>\
			</span>\
			<span class="fk-statusManagement fk-hide">\
				<a class="fk-notOnHold fk-hide" title="Click to change to OnHold">\
					<img style="width:16px" src="' + notOnHold_img_path + '">\
				</a>\
				<a class="fk-onHold fk-hide" title="Click to remove OnHold status">\
					<img style="width:16px" src="' + onHold_img_path + '">\
				</a>\
			</span>\
			<span class="fk-mangaManagement fk-hide">\
				<a class="fk-mRemove" title="Remove from bookmark list">\
					<img src="/Content/Images/exclude.png">\
				</a>\
			</span>\
			<span class="fk-addMangaManagement fk-hide">\
				<a class="fk-mAdd" title="Add to bookmark list">\
					<img src="/Content/Images/plus.png">\
				</a>\
			</span>\
			<img class="fk-imgLoader" src="../../Content/images/loader.gif">\
		</div>\
	');

	// Add the name and url to the manager for genericity
	$(management).attr("data-name", name);
	$(management).attr("data-url", url);

	// Linking of the manager actions
	$(management).find(".fk-bRead").click(function() {
		MarkAsUnread($(this));
	});
	$(management).find(".fk-bUnRead").click(function() {
		MarkAsRead($(this));
	});
	$(management).find(".fk-mRemove").click(function() {
		RemoveManga($(this));
	});
	$(management).find(".fk-mAdd").click(function() {
		AddManga($(this));
	});
	// If the BookmarksSorting option is enabled, we add the status manager
	if (FreeKiss.Options.get("bookmarksSorting") == true) {
		$(management).find(".fk-onHold, .fk-notOnHold").click(function() {
			if ($(this).hasClass("fk-notOnHold")) {
				FreeKiss.Status.set($(this).attr("mid"), Mangas.Status.ONHOLD);
			} else {
				FreeKiss.Status.unset($(this).attr("mid"));
			}
			FreeKiss.Status.save();
			$(this).toggleClass("fk-hide");
			$(this).siblings().toggleClass("fk-hide");
			// Show/Hide the OnHold screen
			$(management).parent().find(".fk-onHoldDisplay, .fk-onHoldSubdisplay").toggleClass("fk-hide");
		});
	} else {
		$(management).find(".fk-statusManagement").remove();
	}
	// If the bookmarks are sync, we update the managers' infos immediately
	if (!Bookmarks.syncing) {
		UpdateBookmarkManagement(management);
	}

	return management;
}

// Add the management information on the manager (bid, mid) or nothing if the manga is not bookmarked
function UpdateBookmarkManagement(node) {
	$(node).find(".fk-imgLoader").addClass("fk-hide");
	// Test if the url is found in the bookmarks
	var bkmark = Bookmarks.getByUrl($(node).attr("data-url"));
	if (bkmark != null) {
		// Unhide the managers
		$(node).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(node).find(".fk-statusManagement").removeClass("fk-hide");
		$(node).find(".fk-mangaManagement").removeClass("fk-hide");

		var r = $(node).find(".fk-bRead");
		var ur = $(node).find(".fk-bUnRead");
		var remove = $(node).find(".fk-mRemove");
		var add = $(node).find(".fk-mAdd");

		$(r).attr("bid", bkmark.bid);
		$(ur).attr("bid", bkmark.bid);
		$(remove).attr("mid", bkmark.mid);
		$(add).attr("mid", bkmark.mid);

		if (bkmark.read == true) {
			ur.addClass("fk-hide");
			r.removeClass("fk-hide");
		} else {
			r.addClass("fk-hide");
			ur.removeClass("fk-hide");
		}

		// If the BookmarksSorting option is enabled, we check the status
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			var oh = $(node).find(".fk-onHold");
			var noh = $(node).find(".fk-notOnHold");
			$(oh).attr("mid", bkmark.mid);
			$(noh).attr("mid", bkmark.mid);
			if (FreeKiss.Status.get(bkmark.mid) == Mangas.Status.ONHOLD) {
				$(oh).removeClass("fk-hide");
				$('a[href="' + bkmark.href + '"] .fk-onHoldDisplay, a[href="' + bkmark.href + '"] .fk-onHoldSubdisplay').removeClass("fk-hide");
			} else {
				$(noh).removeClass("fk-hide");
			}
		}
	} else {
		$(node).find(".fk-addMangaManagement").removeClass("fk-hide");
	}
}

// Show the loading bar and hide the managers
function ShowLoading(management) {
	$(management).find(".fk-bookmarkManagement").addClass("fk-hide");
	$(management).find(".fk-statusManagement").addClass("fk-hide");
	$(management).find(".fk-mangaManagement").addClass("fk-hide");
	$(management).find(".fk-addMangaManagement").addClass("fk-hide");
	$(management).find(".fk-imgLoader").removeClass("fk-hide");
}

// Hide the loading bar. If show is true, unhide the managers
function HideLoading(management, show = false) {
	if (show) {
		$(management).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(management).find(".fk-statusManagement").removeClass("fk-hide");
		$(management).find(".fk-mangaManagement").removeClass("fk-hide");
	} else {
		$(management).find(".fk-addMangaManagement").removeClass("fk-hide");
	}
	$(management).find(".fk-imgLoader").addClass("fk-hide");
}

// Remove the manga whose id is the mid of the passed node
function RemoveManga(node) {
	var management = $(node).parents(".fk-management");
	var isSure = confirm("Do you want to remove \"" + $(management).attr("data-name") + "\" from your bookmark list?");
	if (isSure) {
		ShowLoading(management);

		// Call the the KissManga's page
		$.ajax(
			{
				type: "POST",
				url: "/Bookmark/" + node.attr("mid") + "/remove",
				success: function (message) {
					if (message != "") {
						HideLoading(management);
					} else {
						// TODO ERROR ?
						HideLoading(management, true);
					}
				}
			}
		);
	}
}

// Add the manga whose id is the mid of the passed node
// Note that the mid of new manga is not known on the front page and needs to be fetched
function AddManga(node) {
	var management = $(node).parents(".fk-management");
	ShowLoading(management);
	if ($(node).attr("mid") === undefined) {
		$.ajax(
			{
				type: "GET",
				url: $(management).attr("data-url"),
				success: function (html) {
					var reg = html.match(/mangaID=(\d+)/);
					if (reg != null) {
						$(node).attr("mid", reg[1]);
						AddMangaQuery(node, management);
					} else {
						// TODO ERROR ?
						HideLoading(management);
					}
				}
			}
		);
	} else {
		AddMangaQuery(node, management);
	}
}

// Ajax request to add manga
function AddMangaQuery(node, management) {
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/" + node.attr("mid") + "/add",
			success: function (message) {
				if (message != "") {
					Bookmarks.sync(function() {
						UpdateBookmarkManagement(management);
						HideLoading(management, true);
					});
				} else {
					// TODO ERROR ?
					HideLoading(management);
				}
			}
		}
	);
}

// Mark as read the manga whose id is the bid of the passed node
function MarkAsRead(node) {
	var management = $(node).parents(".fk-management");
	ShowLoading(management);

	// Call the the KissManga's page
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/MarkBookmarkDetail",
			data: {
				"bdid": node.attr('bid'),
				"strAlreadyRead": 1
			},
			success: function (message) {
				if (message != "") {
					node.addClass("fk-hide");
					node.siblings(".fk-bRead").removeClass("fk-hide");
				} else {
					// TODO ERROR ?
				}
				HideLoading(management, true);
			}
		}
	);
}

// Mark as unread the manga whose id is the bid of the passed node
function MarkAsUnread(node) {
	var management = $(node).parents(".fk-management");
    ShowLoading(management);

    // Call the the KissManga's page
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/MarkBookmarkDetail",
			data: {
				"bdid": node.attr('bid'),
				"strAlreadyRead": 0
			},
			success: function (message) {
				if (message != "") {
					node.addClass("fk-hide");
					node.siblings(".fk-bUnRead").removeClass("fk-hide");
				} else {
					// TODO ERROR ?
				}
				HideLoading(management, true);
			}
		}
	);
}