"use strict";

var Management = {
	/*
	* Images used for the managers
	*/
	Images: {
		Default: chrome.extension.getURL("Images/Notifications/NotOnHold.png"),
		OnHold: chrome.extension.getURL("Images/Notifications/OnHold.png"),
		PlanToRead: chrome.extension.getURL("Images/Notifications/OnHold.png"),
	},
	/*
	* Create a manager node allowing the manipulation of bookmarks and status
	* @param {string} name - The name of the manga linked to the manager
	* @param {string} url - The url of the manga linked to the manager
	* @return {jQuery Node} The manager node created
	*/
	CreateManager: function(name, url) {
		let management = $('<div class="fk-management"></div>');

		// Add the name and url to the manager for genericity
		$(management).attr("data-name", name);
		$(management).attr("data-url", url);

		// Add bookmark management
		this._Bookmark(management);
		// If the BookmarksSorting option is enabled, we add the status manager
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			this._Status(management);
		}

		// Add remove option
		this._Remove(management);
		// Add new bookmark option
		this._Add(management);

		// Add loading bar
		this._Loading(management);

		// If the bookmarks are sync, we update the managers' infos immediately
		if (!Bookmarks.syncing) {
			this.UpdateManager(management);
		}

		return management;
	},
	_Bookmark: function(management) {
		$(management).append('\
			<span class="fk-bookmarkManagement fk-hide">\
				<a class="fk-bRead fk-hide" title="Click to change status to \'Unread\'">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/include.png">\
				</a>\
				<a class="fk-bUnRead fk-hide" title="Click to change status to \'Read\'">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/notread.png">\
				</a>\
			</span>\
		');
		$(management).find(".fk-bRead").click(function() {
			MarkAsUnread($(this));
		});
		$(management).find(".fk-bUnRead").click(function() {
			MarkAsRead($(this));
		});
	},
	_Status: function(management) {
		$(management).append('\
			<span class="fk-statusManagement fk-hide">\
				<div class="fk-statusSubMenu fk-hide">\
					<a class="fk-defaultStatus" title="No status">\
						<span class="fk-imgHelper"></span><img style="width:15px" src="' + this.Images.Default + '">\
					</a>\
					<a class="fk-onHoldStatus" title="On hold">\
						<span class="fk-imgHelper"></span><img style="width:15px" src="' + this.Images.OnHold + '">\
					</a>\
					<a class="fk-planToReadStatus" title="Plan to read">\
						<span class="fk-imgHelper"></span><img style="width:15px" src="' + this.Images.PlanToRead + '">\
					</a>\
				</div>\
				<a class="fk-statusDisplay" title="Click to change status">\
					<span class="fk-imgHelper"></span><img style="width:16px" src="' + this.Images.Default + '">\
				</a>\
			</span>\
		');
		$(management).find(".fk-statusDisplay").click(function() {
			$(".fk-statusSubMenu:visible").addClass("fk-hide");
			$(this).siblings(".fk-statusSubMenu").removeClass("fk-hide");
		});
		$(management).find(".fk-defaultStatus").click(function() {
			let manager = $(this).parents(".fk-statusManagement");
			FreeKiss.Status.unset($(this).parent().attr("mid"));
			FreeKiss.Status.save();
			$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.Default);
			$(this).parent().addClass("fk-hide");
		});
		$(management).find(".fk-onHoldStatus").click(function() {
			let manager = $(this).parents(".fk-statusManagement");
			FreeKiss.Status.set($(this).parent().attr("mid"), Mangas.Status.ON_HOLD);
			FreeKiss.Status.save();
			$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.OnHold);
			$(this).parent().addClass("fk-hide");
		});
		$(management).find(".fk-planToReadStatus").click(function() {
			let manager = $(this).parents(".fk-statusManagement");
			FreeKiss.Status.set($(this).parent().attr("mid"), Mangas.Status.PLAN_TO_READ);
			FreeKiss.Status.save();
			$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.PlanToRead);
			$(this).parent().addClass("fk-hide");
		});
		/*$(management).find(".fk-onHoldStatus, .fk-defaultStatus").click(function() {
			if ($(this).hasClass("fk-defaultStatus")) {
				FreeKiss.Status.set($(this).attr("mid"), Mangas.Status.ON_HOLD);
			} else {
				FreeKiss.Status.unset($(this).attr("mid"));
			}
			FreeKiss.Status.save();
			$(this).toggleClass("fk-hide");
			$(this).siblings().toggleClass("fk-hide");
			// Show/Hide the OnHold screen. If there is only one instance of fk-onHoldDisplay, we are on the Manga page
			if ($(".fk-onHoldDisplay").length == 1) {
				$(".fk-onHoldDisplay").toggleClass("fk-hide");
			} else {
				$(management).parent().find(".fk-onHoldDisplay, .fk-onHoldSubdisplay").toggleClass("fk-hide");
			}
		});*/
	},
	_Add: function(management) {
		$(management).append('\
			<span class="fk-addMangaManagement fk-hide">\
				<a class="fk-mAdd" title="Add to bookmark list">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/plus.png">\
				</a>\
			</span>\
		');
		$(management).find(".fk-mAdd").click(function() {
			AddManga($(this));
		});
	},
	_Remove: function(management) {
		$(management).append('\
			<span class="fk-mangaManagement fk-hide">\
				<a class="fk-mRemove" title="Remove from bookmark list">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/exclude.png">\
				</a>\
			</span>\
		');
		$(management).find(".fk-mRemove").click(function() {
			RemoveManga($(this));
		});
	},
	_Loading: function(management) {
		$(management).append('<span class="fk-imgHelper"></span><img class="fk-imgLoader" src="../../Content/images/loader.gif">');
	},
	/*
	* Update a manager node and add informations as the bookmark id (bid) and manga id (mid) if the manga is in the bookmarks
	* @param {jQuery Node} manager - A node created by CreateManager(...)
	*/
	UpdateManager: function(manager) {
		$(manager).find(".fk-imgLoader").addClass("fk-hide");
		// Test if the url is found in the bookmarks
		let bkmark = Bookmarks.getByUrl($(manager).attr("data-url"));

		this._UpdateBookmark(manager, bkmark);
		this._UpdateManga(manager, bkmark);

		// If the BookmarksSorting option is enabled, we check the status
		if (FreeKiss.Options.get("bookmarksSorting") == true) this._UpdateStatus(manager, bkmark);
	},
	_UpdateBookmark: function(manager, bkmark) {
		if (!bkmark) return;

		let r = $(manager).find(".fk-bRead");
		let ur = $(manager).find(".fk-bUnRead");

		$(r).attr("bid", bkmark.bid);
		$(ur).attr("bid", bkmark.bid);

		if (bkmark.read == true) {
			$(ur).addClass("fk-hide");
			$(r).removeClass("fk-hide");
		} else {
			$(r).addClass("fk-hide");
			$(ur).removeClass("fk-hide");
		}

		$(manager).find(".fk-bookmarkManagement").removeClass("fk-hide");
	},
	_UpdateManga: function(manager, bkmark) {
		if (!bkmark) {
			$(manager).find(".fk-addMangaManagement").removeClass("fk-hide");
			return;			
		}

		$(manager).find(".fk-mRemove").attr("mid", bkmark.mid);
		$(manager).find(".fk-mAdd").attr("mid", bkmark.mid);

		$(manager).find(".fk-mangaManagement").removeClass("fk-hide");		
	},
	_UpdateStatus: function(manager, bkmark) {
		if (!bkmark) return;

		$(manager).find(".fk-statusSubMenu").attr("mid", bkmark.mid);

		let statusImg = "";
		let status = FreeKiss.Status.get(bkmark.mid);
		if (status == Mangas.Status.ON_HOLD) {
			statusImg = Management.Images.OnHold;
		} else if (status == Mangas.Status.PLAN_TO_READ) {
			statusImg = Management.Images.PlanToRead;
		} else {
			statusImg = Management.Images.Default;
		}
		$(manager).find(".fk-statusDisplay img").attr("src", statusImg);

		/*let oh = $(manager).find(".fk-onHoldStatus");
		let noh = $(manager).find(".fk-defaultStatus");

		$(oh).attr("mid", bkmark.mid);
		$(noh).attr("mid", bkmark.mid);
		if (FreeKiss.Status.get(bkmark.mid) == Mangas.Status.ON_HOLD) {
			$(oh).removeClass("fk-hide");
			// If there is only one instance of fk-onHoldDisplay, we are on the Manga page
			if ($(".fk-onHoldDisplay").length == 1) {
				$(".fk-onHoldDisplay").toggleClass("fk-hide");
			} else {
				$('a[href="' + bkmark.href + '"] .fk-onHoldDisplay, a[href="' + bkmark.href + '"] .fk-onHoldSubdisplay').removeClass("fk-hide");
			}
		} else {
			$(noh).removeClass("fk-hide");
		}*/

		$(manager).find(".fk-statusManagement").removeClass("fk-hide");
	},
	/*
	* Synchronize the bookmarks with the managers using the Bookmarks class
	*/
	Synchronize: function() {
		Bookmarks.sync(() => {
			$(".fk-management").each((i, manager) => {
				this.UpdateManager(manager);
			});
		});
	}
}

/*
* Event closing any open status submenu when clicking outside of the element
*/
$(document).click(function(event) { 
	if(!$(event.target).closest('.fk-statusManagement').length) {
		$('.fk-statusSubMenu').each((i, elem) => {
			if ($(elem).is(":visible")) {
				$(elem).addClass("fk-hide");
			}
		});
	}
});

// Show the loading bar and hide the managers
function ShowLoading(manager) {
	$(manager).find(".fk-bookmarkManagement").addClass("fk-hide");
	$(manager).find(".fk-statusManagement").addClass("fk-hide");
	$(manager).find(".fk-mangaManagement").addClass("fk-hide");
	$(manager).find(".fk-addMangaManagement").addClass("fk-hide");
	$(manager).find(".fk-imgLoader").removeClass("fk-hide");
}

// Hide the loading bar. If show is true, unhide the managers
function HideLoading(manager, show = false) {
	if (show) {
		$(manager).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(manager).find(".fk-statusManagement").removeClass("fk-hide");
		$(manager).find(".fk-mangaManagement").removeClass("fk-hide");
	} else {
		$(manager).find(".fk-addMangaManagement").removeClass("fk-hide");
	}
	$(manager).find(".fk-imgLoader").addClass("fk-hide");
}

// Remove the manga whose id is the mid of the passed node
function RemoveManga(node) {
	var manager = $(node).parents(".fk-management");
	var isSure = confirm("Do you want to remove \"" + $(manager).attr("data-name") + "\" from your bookmark list?");
	if (isSure) {
		ShowLoading(manager);

		// Call the the KissManga's page
		$.ajax(
			{
				type: "POST",
				url: "/Bookmark/" + node.attr("mid") + "/remove",
				success: function (message) {
					if (message != "") {
						HideLoading(manager);
					} else {
						// TODO ERROR ?
						HideLoading(manager, true);
					}
				}
			}
		);
	}
}

// Add the manga whose id is the mid of the passed node
// Note that the mid of new manga is not known on the front page and needs to be fetched
function AddManga(node) {
	// If the user is not connected, we do nothing
	if (!FreeKiss.isUserConnected()) return;

	var manager = $(node).parents(".fk-management");
	ShowLoading(manager);
	if ($(node).attr("mid") === undefined) {
		$.ajax(
			{
				type: "GET",
				url: $(manager).attr("data-url"),
				success: function (html) {
					var reg = html.match(/mangaID=(\d+)/);
					if (reg != null) {
						$(node).attr("mid", reg[1]);
						AddMangaQuery(node, manager);
					} else {
						// TODO ERROR ?
						HideLoading(manager);
					}
				}
			}
		);
	} else {
		AddMangaQuery(node, manager);
	}
}

// Ajax request to add manga
function AddMangaQuery(node, manager) {
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/" + node.attr("mid") + "/add",
			success: function (message) {
				if (message != "") {
					Bookmarks.sync(function() {
						Management.UpdateManager(manager);
						HideLoading(manager, true);
					});
				} else {
					// TODO ERROR ?
					HideLoading(manager);
				}
			}
		}
	);
}

// Mark as read the manga whose id is the bid of the passed node
function MarkAsRead(node) {
	var manager = $(node).parents(".fk-management");
	ShowLoading(manager);

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
				HideLoading(manager, true);
			}
		}
	);
}

// Mark as unread the manga whose id is the bid of the passed node
function MarkAsUnread(node) {
	var manager = $(node).parents(".fk-management");
    ShowLoading(manager);

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
				HideLoading(manager, true);
			}
		}
	);
}
