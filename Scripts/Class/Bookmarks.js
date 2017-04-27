// Bookmarks class (do not confuse with Bookmarks pages script). Allow to manipulate user's bookmarks
// Bookmarks can be sync with the account using the Sync function. During the sync, each get can be asked to be used as callback,
// waiting for the sync to finish
var Bookmarks = {
	mangas: {},
	syncCallbacks: [],
	syncing: false,
	// Initialise the mangas variable with the bookmarks store in localstorage
	initFromMemory: function() {
		var obj = this;
		chrome.storage.local.get("fk-bookmarks", function(bookmarks) {
				obj.mangas = bookmarks['fk-bookmarks'];
			}
		);
	},
	// Get the bookmarks from a jquery element passed in parameter and save them in memory
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
		this.save();
	},
	// Synchronize the bookmarks. If no jquery node is passed, the bookmarks are sync from the bookmarks page
	sync: function(nodes = null, callback = null) {
		if (callback != null) {
			this.syncCallbacks.push(callback);
		}
		if (nodes === null) {
			// If no nodes are passed, we take the bookmarks from the bookmarks page
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
		} else {
			this.setBookmarks(nodes);
			this.executeCallbacks();
		}
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
	},
	// Save the bookmarks in localstorage
	save: function() {
		chrome.storage.local.set({"fk-bookmarks": this.mangas});
	},
	// Clear the bookmarks in localstorage
	clear: function() {
		chrome.storage.local.remove("fk-bookmarks");
		this.mangas = {};
	}
};
Bookmarks.initFromMemory();