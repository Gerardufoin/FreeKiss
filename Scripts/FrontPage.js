"use strict";

function FrontPage() {
	Bookmarks.sync(function() {
		$(".fk-management").each(function() {
			UpdateBookmarkManagement(this);
		});
	});

	var bookmark_img_path = chrome.extension.getURL("Images/Notifications/Bookmarked.png");

	// Using mutations allow the data to change at page load AND to update new datas when kissmanga adds mangas in the scrollbar
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {

	  	// Add bookmark notifications in the scrollbar
	  	if (mutation.target.className == "items") {
	  		// Search through all the nodes of the mutation with the class "items" (divs inside the scrollbar)
		  	mutation.addedNodes.forEach(function(node) {
		  		// One last check to avoid unneeded mutations
		  		if (node.childNodes.length == 10) {
		  			$(node).find("a").each(function() {
		  				$(this).find("img:first-child").width(130); // Scrollable added by ajax request have a 120px width instead of 130px...
						$(this).wrap('<div class="fk-scrollingWrapper"></div>');
						$(this).addClass("fk-makeRelative");
						/*if (Bookmarks.getByUrl($(this).attr("href")) !== null) {
							$(this).append('<img src="' + bookmark_img_path + '" class="fk-notification fk-scrollableBookmarkNotification">');
						}*/
						// Add the managers
						$(this).before('\
							<div class="fk-management">\
								<span class="fk-bookmarkManagement fk-hide">\
									<a class="fk-bRead fk-hide">\
										<img src="/Content/Images/include.png">\
									</a>\
									<a class="fk-bUnRead fk-hide">\
										<img src="/Content/Images/notread.png">\
									</a>\
								</span>\
								<span class="fk-mangaManagement fk-hide">\
									<a class="fk-mRemove">\
										<img src="/Content/Images/exclude.png">\
									</a>\
								</span>\
								<img class="fk-imgLoader" src="../../Content/images/loader.gif">\
							</div>\
						');

						// Add management clicking interactions
						var management = $(this).prev();
						$(management).find(".fk-bRead").click(function() {
							MarkAsUnread($(this));
						});
						$(management).find(".fk-bUnRead").click(function() {
							MarkAsRead($(this));
						});
						$(management).find(".fk-mRemove").click(function() {
							RemoveManga($(this));
						});
						// If the bookmarks are sync, we update the managers' infos immediately
						if (!Bookmarks.syncing) {
							UpdateBookmarkManagement(management);
						}
					});
		  		}
		  	});
	  	}

	  	// Add bookmark notifications in the submenus (most-popular/new-manga)
	  	/*if (mutation.target.id == "tab-newest" || mutation.target.id == "tab-mostview") {
	  		mutation.addedNodes.forEach(function(node) {
	  			if (node.childNodes.length == 5) {
	  				var mainlink = $(node).find("a:first-child");
	  				if (Bookmarks.getByUrl(mainlink.attr("href")) !== null) {
		  				mainlink.addClass("fk-makeRelative");
		  				mainlink.append('<img src="' + bookmark_img_path + '" class="fk-notification fk-submenuBookmarkNotification">');	  					
	  				}
	  			}
	  		});
	  	}*/

	  });
	});

	observer.observe(document,
		{
			attributes: false,
			attributeOldValue: false,
			childList: true,
			characterData: false,
			subtree: true
		}
	);
}

// Add the management information on the manager (bid, mid) or nothing if the manga is not bookmarked
function UpdateBookmarkManagement(node) {
	$(node).find(".fk-imgLoader").addClass("fk-hide");
	// Test if the url is found in the bookmarks
	var bkmark = Bookmarks.getByUrl($(node).next().attr("href"));
	if (bkmark != null) {
		// Unhide the managers
		$(node).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(node).find(".fk-mangaManagement").removeClass("fk-hide");

		var r = $(node).find(".fk-bRead");
		var ur = $(node).find(".fk-bUnRead");
		var remove = $(node).find(".fk-mRemove");

		$(r).attr("bid", bkmark.bid);
		$(ur).attr("bid", bkmark.bid);
		$(remove).attr("mid", bkmark.mid);

		if (bkmark.read == true) {
			ur.addClass("fk-hide");
			r.removeClass("fk-hide");
		} else {
			r.addClass("fk-hide");
			ur.removeClass("fk-hide");
		}
	}	
}

// Show the loading bar and hide the managers
function ShowLoading(management) {
	$(management).find(".fk-bookmarkManagement").addClass("fk-hide");
	$(management).find(".fk-mangaManagement").addClass("fk-hide");
	$(management).find(".fk-imgLoader").removeClass("fk-hide");
}

// Hide the loading bar. If show is true, unhide the managers
function HideLoading(management, show = false) {
	if (show) {
		$(management).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(management).find(".fk-mangaManagement").removeClass("fk-hide");		
	}
	$(management).find(".fk-imgLoader").addClass("fk-hide");
}

// Remove the manga whose id is the mid of the passed node
function RemoveManga(node) {
	var management = $(node).parents(".fk-management");
    var isSure = confirm("Do you want to remove \"" + $(management).next().contents().filter(function() { return this.nodeType == Node.TEXT_NODE; }).text() + "\" from your bookmark list?");
    if (isSure) {
    	ShowLoading(management);

    	// Call the the KissManga's page
        var obj = this;
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/Bookmark/" + node.attr('mid') + "/remove", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.responseText != "") {
					HideLoading(management);
				} else {
					// TODO ERROR ?
					HideLoading(management, true);
				}
			}
		}
		xhr.send();
    }
}

// Mark as read the manga whose id is the bid of the passed node
function MarkAsRead(node) {
	var management = $(node).parents(".fk-management");
    ShowLoading(management);

    // Call the the KissManga's page
    var obj = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/Bookmark/MarkBookmarkDetail", true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.responseText != "") {
				node.addClass("fk-hide");
				node.siblings(".fk-bRead").removeClass("fk-hide");
			} else {
				// TODO ERROR ?
			}
			HideLoading(management, true);
		}
	}
	xhr.send("bdid=" + node.attr('bid') + "&strAlreadyRead=1");
}

// Mark as unread the manga whose id is the bid of the passed node
function MarkAsUnread(node) {
	var management = $(node).parents(".fk-management");
    ShowLoading(management);

    // Call the the KissManga's page
    var obj = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/Bookmark/MarkBookmarkDetail", true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.responseText != "") {
				node.addClass("fk-hide");
				node.siblings(".fk-bUnRead").removeClass("fk-hide");
			} else {
				// TODO ERROR ?
			}
			HideLoading(management, true);
		}
	}
	xhr.send("bdid=" + node.attr("bid") + "&strAlreadyRead=0");
}

Options.init(FrontPage);