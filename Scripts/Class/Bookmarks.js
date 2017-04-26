// Bookmarks class (do not confuse with Bookmarks pages script). Allow to manipulate user's bookmarks
// Bookmarks can be sync with the account using the Sync function. During the sync, each get can be asked to be used as callback,
// waiting for the sync to finish
var Bookmarks = {
	mangas: {},
	syncCallbacks: [],
	initFromMemory: function() {
		chrome.storage.local.get("fk-bookmarks", function(bookmarks) {
				mangas = bookmarks['fk-bookmarks'];
			}
		);
	},
	setBookmarks: function(bookmarks) {
		mangas = {};
		bookmarks.each(function() {
			var m = {
				// href will be used to do fancy stuffs on the front page, like a blacklist (as the mid/bid are not on the front page)
				href: $(this).find("td:eq(0) a.aManga").attr("href").substring(1),
				bid: $(this).find("td:eq(2) a").attr("bdid")
			};
			mangas[$(this).find("td:eq(3) a").attr("mid")] = m;
		});
		save();
	},
	sync: function(fromWeb = true, callback = null) {
		if (fromWeb) {
			if (callback != null) {
				syncCallbacks.push(callback);
			}
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://kissmanga.com/BookmarkList", true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
				    setBookmarks($(xhr.responseText).find(".listing tr:not(:first-child)"));
				}
			}
			xhr.send();
		}
		// TODO
	},
	// Check if there is any bookmarks loaded
	empty: function() {
		return (Object.keys(mangas).length == 0);
	}
	// Save the bookmarks in localstorage
	save: function() {
		chrome.storage.local.set({"fk-bookmarks": this.mangas});
	},
	// Clear the bookmarks in localstorage
	clear: function() {
		chrome.storage.local.remove("fk-bookmarks");
	}
};
Bookmarks.initFromMemory();