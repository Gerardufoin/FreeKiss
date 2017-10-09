"use strict";

var Management = {
	/*
	* Images used for the managers
	*/
	Images: {
		Default: chrome.extension.getURL("Images/Notifications/NotOnHold.png"),
		OnHold: chrome.extension.getURL("Images/Notifications/OnHold.png"),
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
					<img src="/Content/Images/include.png">\
				</a>\
				<a class="fk-bUnRead fk-hide" title="Click to change status to \'Read\'">\
					<img src="/Content/Images/notread.png">\
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
				<a class="fk-notOnHold fk-hide" title="Click to change to OnHold">\
					<img style="width:16px" src="' + this.Images.Default + '">\
				</a>\
				<a class="fk-onHold fk-hide" title="Click to remove OnHold status">\
					<img style="width:16px" src="' + this.Images.OnHold + '">\
				</a>\
			</span>\
		');
		$(management).find(".fk-onHold, .fk-notOnHold").click(function() {
			if ($(this).hasClass("fk-notOnHold")) {
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
		});
	},
	_Add: function(management) {
		$(management).append('\
			<span class="fk-addMangaManagement fk-hide">\
				<a class="fk-mAdd" title="Add to bookmark list">\
					<img src="/Content/Images/plus.png">\
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
					<img src="/Content/Images/exclude.png">\
				</a>\
			</span>\
		');
		$(management).find(".fk-mRemove").click(function() {
			RemoveManga($(this));
		});
	},
	_Loading: function(management) {
		$(management).append('<img class="fk-imgLoader" src="../../Content/images/loader.gif">');
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

		let oh = $(manager).find(".fk-onHold");
		let noh = $(manager).find(".fk-notOnHold");

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
		}

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
	// If the user is not connected, we do nothing
	if (!FreeKiss.isUserConnected()) return;

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
						Manager.UpdateManager(management);
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
