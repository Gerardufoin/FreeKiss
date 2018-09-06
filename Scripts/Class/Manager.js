"use strict";

/** Management class. Allow the creation and management of the managers nodes */
var Management = {
	/*
	 * Images used for the managers
	 */
	Images: {
		Default: chrome.extension.getURL("Images/Status/Default.png"),
		OnHold: chrome.extension.getURL("Images/Status/OnHold.png"),
		PlanToRead: chrome.extension.getURL("Images/Status/PlanToRead.png"),
	},
	/**
	 * PUBLIC
	 * Create a manager node allowing the manipulation of bookmarks and status
	 * @param {string} name - The name of the manga linked to the manager
	 * @param {string} url - The url of the manga linked to the manager
	 * @param {jQuery Node} statusDisplay - Node containing the status displayers. If null, the displays are not added to the page.
	 * @return {jQuery Node} The manager node created
	 */
	CreateManager: function(name, url, statusDisplay = null) {
		let manager = $('<div class="fk-management"></div>');

		// Add the name and url to the manager for genericity
		$(manager).attr("data-name", name);
		$(manager).attr("data-url", decodeURIComponent(url));

		// Add bookmark management
		this._Bookmark(manager);
		// If the BookmarksSorting option is enabled, we add the status manager
		if (FreeKiss.Options.get("bookmarksSorting") == true) {
			this._Status(manager, statusDisplay);
		}

		// Add remove option
		this._Remove(manager);
		// Add new bookmark option
		this._Add(manager);

		// Add loading bar
		this._Loading(manager);

		// If the bookmarks are sync, we update the managers' infos immediately
		if (!Bookmarks.syncing) {
			this.UpdateManager(manager, statusDisplay);
		}

		return manager;
	},
	/**
	 * PRIVATE
	 * Add the buttons allowing to mark a bookmark as read/unread to the manager passed as parameter
	 * @param {jQuery Node} manager - The manager to which the nodes will be added
	 */
	_Bookmark: function(manager) {
		$(manager).append('\
			<span class="fk-bookmarkManagement fk-hide">\
				<a class="fk-bRead fk-hide" title="Click to change status to \'Unread\'">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/include.png">\
				</a>\
				<a class="fk-bUnRead fk-hide" title="Click to change status to \'Read\'">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/notread.png">\
				</a>\
			</span>\
		');
		$(manager).find(".fk-bRead").click(function() {
			MarkAsUnread($(this));
		});
		$(manager).find(".fk-bUnRead").click(function() {
			MarkAsRead($(this));
		});
	},
	/**
	 * PRIVATE
	 * Add the buttons allowing to change the status of the bookmark to the manager passed as parameter
	 * @param {jQuery Node} manager - The manager to which the nodes will be added
	 * @param {jQuery Node} statusDisplay - Node that will contain the status displayers. If null, they are not added to the page
	 */
	_Status: function(manager, statusDisplay = null) {
		$(manager).append('\
			<span class="fk-statusManagement fk-hide">\
				<div class="fk-statusSubMenu fk-hide">\
					<a class="fk-defaultStatus" title="Reading">\
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
		// Display the submenu when the status button is clicked
		$(manager).find(".fk-statusDisplay").click((e) => {
			// Close all currently opened submenu
			$(".fk-statusSubMenu:visible").addClass("fk-hide");
			$(e.currentTarget).siblings(".fk-statusSubMenu").removeClass("fk-hide");
		});
		$(manager).find(".fk-defaultStatus").click((e) => {
			this._ChangeStatus(e.currentTarget, Mangas.Status.DEFAULT, Management.Images.Default, manager);
		});
		$(manager).find(".fk-onHoldStatus").click((e) => {
			this._ChangeStatus(e.currentTarget, Mangas.Status.ON_HOLD, Management.Images.OnHold, manager, {
				"OnHoldDisplay": true
			});
		});
		$(manager).find(".fk-planToReadStatus").click((e) => {
			this._ChangeStatus(e.currentTarget, Mangas.Status.PLAN_TO_READ, Management.Images.PlanToRead, manager, {
				"PlanToReadDisplay": true
			});
		});
		// Add status displayers
		if (statusDisplay != null) {
			$(statusDisplay).append('<div class="fk-onHoldDisplay fk-hide">On Hold</div><div class="fk-planToReadDisplay fk-hide">Plan To Read</div>');
		}
	},
	/**
	 * PRIVATE
	 * Allow to change the status of a bookmark and display those changes to the current page.
	 * Set the status, the image of the StatusDisplay, and apply the options (any unset option are considered as disabled)
	 * @param {jQuery Node} elem - The node which fired the event
	 * @param {Mangas.Status} status - New status of the bookmark
	 * @param {Management.Images} image - Path to the image to display as new status
	 * @param {jQuery Node} manager - Manager node linked to the bookmark
	 * @param {JSON} options - Options to display some specific screen.
	 */
	_ChangeStatus: function(elem, status, image, manager, options = {}) {
		FreeKiss.Status.set($(elem).parent().attr("mid"), status);
		FreeKiss.Status.save();
		// Update FreeKiss' icon as status change the unread counter when in enhancedDisplay mode
		FreeKiss.updateIcon(Bookmarks, false);
		$(elem).parents(".fk-statusManagement").find(".fk-statusDisplay img").attr("src", image);
		$(elem).parent().addClass("fk-hide");

		this._showOnHoldDisplay(manager, options.hasOwnProperty("OnHoldDisplay") && options["OnHoldDisplay"]);
		this._showPlanToReadDisplay(manager, options.hasOwnProperty("PlanToReadDisplay") && options["PlanToReadDisplay"]);
	},
	/**
	 * PRIVATE
	 * Add the button to add the manga as bookmark to the manager passed as parameter
	 * @param {jQuery Node} manager - The manager to which the nodes will be added
	 */
	_Add: function(manager) {
		$(manager).append('\
			<span class="fk-addMangaManagement fk-hide">\
				<a class="fk-mAdd" title="Add to bookmark list">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/plus.png">\
				</a>\
			</span>\
		');
		$(manager).find(".fk-mAdd").click(function() {
			AddManga($(this));
		});
	},
	/**
	 * PRIVATE
	 * Add the button to remove the manga from the bookmarks to the manager passed as parameter
	 * @param {jQuery Node} manager - The manager to which the nodes will be added
	 */
	_Remove: function(manager) {
		$(manager).append('\
			<span class="fk-mangaManagement fk-hide">\
				<a class="fk-mRemove" title="Remove from bookmark list">\
					<span class="fk-imgHelper"></span><img src="/Content/Images/exclude.png">\
				</a>\
			</span>\
		');
		$(manager).find(".fk-mRemove").click(function() {
			RemoveManga($(this));
		});
	},
	/**
	 * PRIVATE
	 * Add the loading bar to the manager passed as parameter
	 * @param {jQuery Node} manager - The manager to which the node will be added
	 */
	_Loading: function(manager) {
		$(manager).append('<span class="fk-imgHelper"></span><img class="fk-imgLoader" src="../../Content/images/loader.gif">');
	},
	/**
	 * PUBLIC
	 * Update a manager node and add informations as the bookmark id (bid) and manga id (mid) if the manga is in the bookmarks
	 * @param {jQuery Node} manager - A node created by CreateManager(...)
	 * @param {jQuery Node} statusDisplay - Node containing the status displayers. If null the default node for the displayers will be tried
	 */
	UpdateManager: function(manager, statusDisplay = null) {
		$(manager).find(".fk-imgLoader").addClass("fk-hide");
		// Test if the url is found in the bookmarks
		let bkmark = Bookmarks.getByUrl($(manager).attr("data-url"));

		this._UpdateBookmark(manager, bkmark);
		this._UpdateManga(manager, bkmark);

		// If the BookmarksSorting option is enabled, we check the status
		if (FreeKiss.Options.get("bookmarksSorting") == true) this._UpdateStatus(manager, bkmark, statusDisplay);
	},
	/**
	 * PRIVATE
	 * Update the bookmark status (read/unread) of the manager based on the datas fetched by the class Bookmarks
	 * @param {jQuery Node} manager - The manager affected by the update
	 * @param {JSON} bkmark - Datas of a specific bookmark received from the class Bookmarks
	 */
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
	/**
	 * PRIVATE
	 * Show if the manga is bookmarked or not on the manager based on the datas fetched by the class Bookmarks
	 * @param {jQuery Node} manager - The manager affected by the update
	 * @param {JSON} bkmark - Datas of a specific bookmark received from the class Bookmarks
	 */
	_UpdateManga: function(manager, bkmark) {
		if (!bkmark) {
			$(manager).find(".fk-addMangaManagement").removeClass("fk-hide");
			return;
		}

		$(manager).find(".fk-mRemove").attr("mid", bkmark.mid);
		$(manager).find(".fk-mAdd").attr("mid", bkmark.mid);

		$(manager).find(".fk-mangaManagement").removeClass("fk-hide");
	},
	/**
	 * PRIVATE
	 * Update the manga status (default/on hold/plan to read) of the manager based on the datas fetched by the class Bookmarks
	 * @param {jQuery Node} manager - The manager affected by the update
	 * @param {JSON} bkmark - Datas of a specific bookmark received from the class Bookmarks
	 * @param {jQuery Node} statusDisplay - Node containing the status displayers. If null the default node for the displayers will be tried
	 */
	_UpdateStatus: function(manager, bkmark, statusDisplay = null) {
		if (!bkmark) return;

		$(manager).find(".fk-statusSubMenu").attr("mid", bkmark.mid);

		switch (FreeKiss.Status.get(bkmark.mid)) {
			case Mangas.Status.ON_HOLD:
				$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.OnHold);
				this._showOnHoldDisplay(manager, true, statusDisplay);
				this._showPlanToReadDisplay(manager, false, statusDisplay);
				break;
			case Mangas.Status.PLAN_TO_READ:
				$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.PlanToRead);
				this._showPlanToReadDisplay(manager, true, statusDisplay);
				this._showOnHoldDisplay(manager, false, statusDisplay);
				break;
			default:
				$(manager).find(".fk-statusDisplay img").attr("src", Management.Images.Default);
				this._showOnHoldDisplay(manager, false, statusDisplay);
				this._showPlanToReadDisplay(manager, false, statusDisplay);
		}

		$(manager).find(".fk-statusManagement").removeClass("fk-hide");
	},
	/**
	 * PRIVATE
	 * Show or hide the OnHold screen on manga's preview.
	 * @param {jQuery Node} manager - A manager node
	 * @param {boolean} show - Show the "on hold" screen if true, hides it otherwise
	 * @param {jQuery Node} statusDisplay - Node containing the status displayers. If null the default node for the displayers will be tried
	 */
	_showOnHoldDisplay: function(manager, show, statusDisplay = null) {
		// If there is only one instance of fk-onHoldDisplay, we are on the Manga page
		if ($(".fk-onHoldDisplay").length == 1) {
			if (show) {
				$(".fk-onHoldDisplay").removeClass("fk-hide");
			} else {
				$(".fk-onHoldDisplay").addClass("fk-hide");
			}
		} else {
			let dest = (statusDisplay != null ? statusDisplay : $(manager).parent());
			if (show) {
				$(dest).find(".fk-onHoldDisplay").removeClass("fk-hide");
			} else {
				$(dest).find(".fk-onHoldDisplay").addClass("fk-hide");
			}
		}
	},
	/**
	 * PRIVATE
	 * Show or hide the PlanToRead screen on manga's preview.
	 * @param {jQuery Node} manager - A manager node
	 * @param {boolean} show - Show the "plan to read" screen if true, hides it otherwise
	 * @param {jQuery Node} statusDisplay - Node containing the status displayers. If null the default node for the displayers will be tried
	 */
	_showPlanToReadDisplay: function(manager, show, statusDisplay = null) {
		// If there is only one instance of fk-planToReadDisplay, we are on the Manga page
		if ($(".fk-planToReadDisplay").length == 1) {
			if (show) {
				$(".fk-planToReadDisplay").removeClass("fk-hide");
			} else {
				$(".fk-planToReadDisplay").addClass("fk-hide");
			}
		} else {
			let dest = (statusDisplay != null ? statusDisplay : $(manager).parent());
			if (show) {
				$(dest).find(".fk-planToReadDisplay").removeClass("fk-hide");
			} else {
				$(dest).find(".fk-planToReadDisplay").addClass("fk-hide");
			}
		}
	},
	/**
	 * PUBLIC
	 * Synchronize the bookmarks with the managers using the Bookmarks class
	 */
	Synchronize: function() {
		Bookmarks.sync(() => {
			// Updates FreeKiss' icon unread counter and reset the alarm any time the bookmarks are sync (prevents useless call to bookmarklist)
			FreeKiss.updateIcon(Bookmarks, true);
			$(".fk-management").each((i, manager) => {
				this.UpdateManager(manager);
			});
		});
	}
}

/** Event closing any open status submenu when clicking outside of the element */
$(document).click(function(event) { 
	if(!$(event.target).closest('.fk-statusManagement').length) {
		$('.fk-statusSubMenu').each((i, elem) => {
			if ($(elem).is(":visible")) {
				$(elem).addClass("fk-hide");
			}
		});
	}
});

/**
 * Show the loading bar and hide the managers
 * @param {manager node} manager - The manager node affected
 */
function ShowLoading(manager) {
	$(manager).find(".fk-bookmarkManagement").addClass("fk-hide");
	$(manager).find(".fk-statusManagement").addClass("fk-hide");
	$(manager).find(".fk-mangaManagement").addClass("fk-hide");
	$(manager).find(".fk-addMangaManagement").addClass("fk-hide");
	$(manager).find(".fk-imgLoader").removeClass("fk-hide");
}

/**
 * Hide the loading bar.
 * @param {manager node} manager - The manager node affected
 * @param {boolean} show - If show is true, unhide the management nodes
 */
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

/**
 * Remove the manga whose id is the mid of the passed node
 * @param {jQuery node} node - The node containing the manga id of the bookmark to remove
 */
function RemoveManga(node) {
	let manager = $(node).parents(".fk-management");
	let isSure = confirm("Do you want to remove \"" + $(manager).attr("data-name") + "\" from your bookmark list?");
	if (isSure) {
		ShowLoading(manager);

		let mid = node.attr("mid");
		// Call the the KissManga's page
		$.ajax(
			{
				type: "POST",
				url: "/Bookmark/" + mid + "/remove",
				success: function (message) {
					if (message != "") {
						Bookmarks.remove(mid);
						FreeKiss.updateIcon(Bookmarks, false);
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

/**
 * Add the manga whose id is the mid of the passed node
 * Note that the mid of new manga is not known on the front page and needs to be fetched
 * @param {jQuery node} node - The node containing the manga id of the bookmark to add
 */
function AddManga(node) {
	// If the user is not connected, we do nothing
	if (!FreeKiss.isUserConnected()) return;

	let manager = $(node).parents(".fk-management");
	ShowLoading(manager);
	if ($(node).attr("mid") === undefined) {
		$.ajax(
			{
				type: "GET",
				url: $(manager).attr("data-url"),
				success: function (html) {
					let reg = html.match(/mangaID=(\d+)/);
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

/**
 * Ajax request to add manga
 * @param {jQuery node} node - Node containing the manga id of the manga to add
 * @param {manager node} manager - Manager associated to the manga
 */
function AddMangaQuery(node, manager) {
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/" + node.attr("mid") + "/add",
			success: function (message) {
				if (message != "") {
					Bookmarks.sync(function() {
						FreeKiss.updateIcon(Bookmarks, true);
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

/**
 * Mark as read the manga whose id is the bid of the passed node
 * @param {jQuery node} node - Node containing the bookmark id of the affected bookmark
 */
function MarkAsRead(node) {
	let manager = $(node).parents(".fk-management");
	ShowLoading(manager);

	let bid = node.attr('bid');
	// Call the the KissManga's page
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/MarkBookmarkDetail",
			data: {
				"bdid": bid,
				"strAlreadyRead": 1
			},
			success: function (message) {
				if (message != "") {
					Bookmarks.setRead(bid, true);
					FreeKiss.updateIcon(Bookmarks, false);
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

/**
 * Mark as unread the manga whose id is the bid of the passed node
 * @param {jQuery node} node - Node containing the bookmark id of the affected bookmark
 */
function MarkAsUnread(node) {
	let manager = $(node).parents(".fk-management");
	ShowLoading(manager);

	let bid = node.attr('bid');
	// Call the the KissManga's page
	$.ajax(
		{
			type: "POST",
			url: "/Bookmark/MarkBookmarkDetail",
			data: {
				"bdid": bid,
				"strAlreadyRead": 0
			},
			success: function (message) {
				if (message != "") {
					Bookmarks.setRead(bid, false);
					FreeKiss.updateIcon(Bookmarks, false);
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
