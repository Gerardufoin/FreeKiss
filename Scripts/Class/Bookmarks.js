// Bookmarks class (do not confuse with Bookmarks pages script). Allow to get user's bookmarks using the sync function
// During the sync, functions can be registered to be called at the end of the synchronization
var Bookmarks = {
	mangas: {},
	syncCallbacks: [],
	syncing: false,
	// Get the bookmarks from a jquery element passed in parameter
	setBookmarks: function(bookmarks) {
		this.mangas = {};
		var obj = this;
		bookmarks.each(function() {
			var m = {
				// href will be used to do fancy stuffs on the front page, like a blacklist (as the mid/bid are not on the front page)
				href: $(this).find("td:eq(0) a.aManga").attr("href").substring(1),
				bid: $(this).find("td:eq(2) a").attr("bdid"),
				read: ($(this).find("td:eq(2) .aRead").css('display') != 'none')
			};
			obj.mangas[$(this).find("td:eq(3) a").attr("mid")] = m;
		});
	},
	// Synchronize the bookmarks.
	sync: function(callback = null) {
		if (callback != null) {
			this.syncCallbacks.push(callback);
		}
		this.syncing = true;
		var obj = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://kissmanga.com/BookmarkList", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			    obj.setBookmarks($(xhr.responseText).find(".listing tr:not(:first-child)"));
			    obj.executeCallbacks();
			    obj.syncing = false;
			}
		}
		xhr.send();
	},
	// Queue a function for when the bookmarks are loaded
	queueCallback: function(callback) {
		if (this.syncing) {
			this.syncCallbacks.push(callback);			
		} else {
			callback();
		}
	},
	// Execute all the stored synchronization dependant callbacks
	executeCallbacks: function() {
		for (var i = 0; i < this.syncCallbacks.length; ++i) {
			this.syncCallbacks[i]();
		}
		this.syncCallbacks = [];
	},
	// Get a bookmark using its url (when no mID is available (looking at you, frontpage è.é))
	getByUrl: function(url) {
		for (var key in this.mangas) {
		 	if (this.mangas.hasOwnProperty(key) && this.mangas[key].href == url) {
				var ret = this.mangas[key];
				ret.mid = key;
				return ret;
			}
		}
		return null;
	},
	// Check if there is any bookmarks loaded
	isEmpty: function() {
		return (Object.keys(this.mangas).length == 0);
	}
};