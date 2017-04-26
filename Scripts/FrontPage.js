"use strict";

function FrontPage() {

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://kissmanga.com/BookmarkList", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
		    // JSON.parse does not evaluate the attacker's scripts.
		    console.log("OK");

			// Bookmarks infos
			var mangas = {};
			$(xhr.responseText).find(".listing tr:not(:first-child)").each(function() {
					var m = {
						// href will be used to do fancy stuffs on the front page, like a blacklist (as the mid/bid are not on the front page)
						href: $(this).find("td:eq(0) a.aManga").attr("href").substring(1),
						bid: $(this).find("td:eq(2) a").attr("bdid")
					};
					mangas[$(this).find("td:eq(3) a").attr("mid")] = m;
				});

			// Storage of the bookmarks in memory. Used to add bookmark management directly on the mangas' chapters
			chrome.storage.local.set({"fk-bookmarks": mangas});
		}
	}
	xhr.send();

	// Bookmarks management
	chrome.storage.local.get("fk-bookmarks", function(bookmarks) {
		bookmarks = bookmarks['fk-bookmarks'];
		if (Object.keys(bookmarks).length == 0) return;

		// Push all the links in an array. Used below to find which mangas is bookmarked
		var hrefs = [];
		for (var mid in bookmarks) {
			hrefs.push(bookmarks[mid].href);
		}

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
							if ($.inArray($(this).attr("href"), hrefs) !== -1) {
								$(this).append('<img src="' + bookmark_img_path + '" class="fk-notification fk-scrollableBookmarkNotification">');
							}
							$(this).before('\
								<div class="fk-management">\
									<span class="fk-bookmarkManagement fk-hide">\
										<a class="fk-bRead">\
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
						});
			  		}
			  	});
		  	}

		  	// Add bookmark notifications in the submenus (most-popular/new-manga)
		  	if (mutation.target.id == "tab-newest" || mutation.target.id == "tab-mostview") {
		  		mutation.addedNodes.forEach(function(node) {
		  			if (node.childNodes.length == 5) {
		  				var mainlink = $(node).find("a:first-child");
		  				if ($.inArray(mainlink.attr("href"), hrefs) !== -1) {
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
	});	
}

Options.init(FrontPage);