"use strict";

function UpdateBookmarkManagement(node) {
	$(node).find(".fk-imgLoader").addClass("fk-hide");
	var bkmark = Bookmarks.getByUrl($(node).next().attr("href"));
	if (bkmark != null) {
		$(node).find(".fk-bookmarkManagement").removeClass("fk-hide");
		$(node).find(".fk-mangaManagement").removeClass("fk-hide");

		var r = $(node).find(".fk-bRead");
		var ur = $(node).find(".fk-bUnRead");
		if (bkmark.read == true) {
			ur.addClass("fk-hide");
			r.removeClass("fk-hide");
		} else {
			r.addClass("fk-hide");
			ur.removeClass("fk-hide");
		}
	}	
}

function FrontPage() {
	Bookmarks.sync(null, function() {
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
						if (Bookmarks.getByUrl($(this).attr("href")) !== null) {
							$(this).append('<img src="' + bookmark_img_path + '" class="fk-notification fk-scrollableBookmarkNotification">');
						}
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
									<a>\
										<img src="/Content/Images/exclude.png">\
									</a>\
								</span>\
								<img class="fk-imgLoader" src="../../Content/images/loader.gif">\
							</div>\
						');
						if (!Bookmarks.syncing) {
							UpdateBookmarkManagement($(this).prev());
						}
					});
		  		}
		  	});
	  	}

	  	// Add bookmark notifications in the submenus (most-popular/new-manga)
	  	if (mutation.target.id == "tab-newest" || mutation.target.id == "tab-mostview") {
	  		mutation.addedNodes.forEach(function(node) {
	  			if (node.childNodes.length == 5) {
	  				var mainlink = $(node).find("a:first-child");
	  				if (Bookmarks.getByUrl(mainlink.attr("href")) !== null) {
		  				mainlink.addClass("fk-makeRelative");
		  				mainlink.append('<img src="' + bookmark_img_path + '" class="fk-notification fk-submenuBookmarkNotification">');	  					
	  				}
	  			}
	  		});
	  	}

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

Options.init(FrontPage);