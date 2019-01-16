/**
 * Bookmarks class (do not confuse with Bookmarks pages script). Allow to get user's bookmarks using the sync function
 * During the sync, functions can be registered to be called at the end of the synchronization
 */
var Bookmarks = {
	mangas: {},
	syncCallbacks: [],
	syncing: false,
	// Flag. If set to true, store additionnal informations on the bookmarks
	extended: false,
	/**
	 * Get the bookmarks from a jquery element passed in parameter
	 * @param {jQuery Node} bookmarks - Node containing the bookmarks in a table format
	 */
	setBookmarks: function(bookmarks) {
		this.mangas = {};
		bookmarks.each((i, node) => {
			if ($(node).find('td').length > 3) {
				this.updateBookmark(node);
			}
		});
	},
	/**
	 * Update the information of a specific bookmark
	 * @param {jQuery Node} node - A bookmark node found on the bookmarklist page
	 * @return {integer} - Manga id of the updated bookmark
	 */
	updateBookmark: function(node) {
		let mid = $(node).find("td:eq(3) a").attr("mid");
		let link = $(node).find("td:eq(0) a.aManga");
		let m = {
			// href will be used to do fancy stuffs on the front page, like a blacklist (as the mid/bid are not on the front page)
			href: $(link).attr("href").substring(1),
			bid: $(node).find("td:eq(2) a").attr("bdid"),
			read: ($(node).find("td:eq(2) .aRead").css('display') != 'none')
		};
		if (this.extended) {
			m.name = $(link).text().trim();
			m.completed = $(node).find("td:eq(1) a").length == 0;
		}
		this.mangas[mid] = m;
		return mid;
	},
	/**
	 * Synchronize the bookmarks. The bookmarks are fetched from kissmanga BookmarkList page via an ajax request.
	 * @param {function} callback - The function to call when the bookmarks are loaded. Multiple call to sync queue the callbacks
	 * @param {boolean} syncOnce - If set to true, do not sync the bookmarks if they have already been sync one time. False by default
	 * @param {function(int)} errorCB - This callback can be called if there is a problem with the ajax request. The error code is passed to the callback as parameter.
	 */
	sync: function(callback = null, syncOnce = false, errorCB = null) {
		if (syncOnce && !this.isEmpty()) {
			callback();
			return;
		}
		if (callback != null) {
			this.syncCallbacks.push(callback);
		}
		if (!this.syncing) {
			this.syncing = true;
			var obj = this;
			$.ajax({
				type: "GET",
				url: "https://kissmanga.com/BookmarkList",
				success: (html) => {
					// We remove elements making FireFox cry about CSP (onClick, Images and everything beside the .listing table)
					html = html.replace(/onClick=['"].+?['"]|<img[^>]*>|\r?\n|\r/gi, "");
					let table = html.match(/<table[^>]+class=['"]listing['"].*<\/table>/gi);
					if (table != null) {
						obj.setBookmarks($(table[0]).find("tr:not(:first-child)"));
					}
					obj.executeCallbacks();
				},
				error: (req, status, err) => {
					console.error("Error " + req.status + " while connecting to bookmarks list: " + err);
					if (errorCB) {
						errorCB(req.status);
					}
				},
				complete: () => {
					obj.syncing = false;
				}
			});
		}
	},
	/**
	 * Queue a callback in the syncCallbacks list.
	 * @param {function} callback - Callback to queue
	 */
	queueCallback: function(callback) {
		if (this.syncing) {
			this.syncCallbacks.push(callback);
		} else {
			callback();
		}
	},
	/**
	 * Execute all the stored synchronization dependant callbacks. The syncCallbacks queue is then cleared.
	 */
	executeCallbacks: function() {
		for (var i = 0; i < this.syncCallbacks.length; ++i) {
			this.syncCallbacks[i]();
		}
		this.syncCallbacks = [];
	},
	/**
	 * Get a bookmark using its url. (To use when no mID is available (looking at you, frontpage è.é))
	 * @param {string} url - Url of the bookmark page. Note that only the end of the url is stored (format: "Manga/*")
	 * @return {JSON} Informations about the bookmark or null if the url does not match a stored bookmark
	 */
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
	/**
	 * Check if there is any bookmarks loaded
	 * @return {boolean} True if there are bookmarks in the mangas variable, false otherwise
	 */
	isEmpty: function() {
		return (Object.keys(this.mangas).length == 0);
	},
	/**
	 * Return all the bookmarks informations
	 * @return {JSON} Bookmarks informations
	 */
	fetchAll: function() {
		return this.mangas;
	},
	/**
	 * Return the number of bookmarks
	 * @return {integer} Number of bookmarks
	 */
	count: function() {
		return Object.keys(this.mangas).length;
	},
	/**
	 * Change the read status of a registered bookmark
	 * @param {int} bid - The bookmark's ID of the bookmark to update
	 * @param {Boolean} isRead - New read status
	 */
	setRead: function(bid, isRead) {
		for (var key in this.mangas) {
			if (this.mangas.hasOwnProperty(key) && this.mangas[key].bid == bid) {
				this.mangas[key].read = isRead;
				return ;
			}
		}
	},
	/**
	 * Remove the selected bookmark from the array
	 * @param {int} mid - The manga's id of the bookmark to remove
	 */
	remove: function(mid) {
		if (this.mangas.hasOwnProperty(mid)) {
			delete this.mangas[mid];
		}
	}
};