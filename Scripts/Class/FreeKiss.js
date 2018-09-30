/** Mangas status enum */
var Mangas = {
	Status: {
		NONE: 0,
		ON_HOLD: 1,
		PLAN_TO_READ: 2
	}
};

/**
 * FreeKiss class.
 * Manage the relation between FreeKiss and the localstorage (options, bookmarks status, etc.)
 * Every script should put its main function in init to check if FreeKiss is enabled
 */
var FreeKiss = {
	/**
	 * Option subclass.
	 * Allow to manipulate FreeKiss options
	 */
	Options: {
		/** Default options */
		options: {
			frontpageManager: true,
			mangaManager: true,
			chapterManager: true,
			enhancedDisplay: true,
			bookmarksSorting: true,
			showComments: true,
			showUnreadOnIcon: false,
			showUnreadRefreshRate: 30,
			maxPageWidth: 800,
			maxDoublePageWidth: 1800,
			minPageWidth: 600,
			minDoublePageWidth: 1000,
			maxDisable: false,
			minDisable: false,
			disable: false
		},
		/**
		 * Use init to load the options.
		 * @param {FreeKiss} fk - The FreeKiss instance calling init
		 */
		init: function(fk) {
			chrome.storage.local.get("fk-options", (opt) => {
				if (opt['fk-options'] != null && Object.keys(opt['fk-options']).length > 0) {
					this.options = Object.assign(this.options, opt['fk-options']);
				}
				fk.optionsLoaded = true;
				fk.loaded();
			});
		},
		/**
		 * Check if the option is set
		 * @param {string} property - Name of the option to check
		 * @return {boolean} True if set, false otherwise
		 */
		isSet: function(property) {
			return (this.options != null && this.options.hasOwnProperty(property));
		},
		/**
		 * Return the option value
		 * @param {string} property - Name of the option to get
		 * @return {(boolean|number)} The value of the option or null if the option does not exist
		 */
		get: function(property) {
			return (this.isSet(property) ? this.options[property] : null);
		},
		/**
		 * Set the property in the options with the appropriate value
		 * @param {string} property - Name of the option to set
		 * @param {(boolean|number)} value - Value of the option to set
		 */
		set: function(property, value) {
			this.options[property] = value;
		},
		/** Save the options in localstorage */
		save: function() {
			chrome.storage.local.set({"fk-options": this.options});
		},
		/** Clear the options in localstorage */
		clear: function() {
			chrome.storage.local.remove("fk-options");
		}
	},
	/** Manga Status subclass. Allow to manipulate mangas status. */
	Status: {
		mangas: {},
		/**
		 * Use init to load the status.
		 * @param {FreeKiss} fk - The FreeKiss instance calling init
		 */
		init: function(fk) {
			this.saveMethod().get("fk-status", (opt) => {
				if (opt['fk-status'] != null && Object.keys(opt['fk-status']).length > 0) {
					let st = this.decompress(opt['fk-status']);
					if (st != null) this.mangas = st;
				}
				fk.statusLoaded = true;
				fk.loaded();
			});
		},
		/**
		 * Compress json with lz-string.
		 * @param {JSON} json - JSON to compress
		 * @return {UTF-16 string} JSON compressed as string or null if invalid
		 */
		compress: function(json) {
			try {
				return LZString.compressToUTF16(JSON.stringify(json));
			} catch(e) {
				console.error("Unable to compress status json.");
				return null;
			}
		},
		/**
		 * Decompress json with lz-string.
		 * @param {UTF-16 string} data - String containing the compressed data
		 * @return {JSON} JSON or null if the string is invalid
		 */
		decompress: function(data) {
			try {
				return JSON.parse(LZString.decompressFromUTF16(data));
			} catch(e) {
				console.error("Unable to decompress status json.");
				return null;
			}
		},
		/**
		 * Check if the manga has a status
		 * @param {integer} mid - Id of the manga to check
		 * @return {boolean} True if the manga has a status, false otherwise
		 */
		isSet: function(mid) {
			return (this.mangas != null && this.mangas.hasOwnProperty(mid));
		},
		/** 
		 * Get the status of a manga
		 * @param {integer} mid - Id of the manga to get
		 * @return {Mangas.Status ENUM} Status of the manga or 0 if the manga does not have a status
		 */
		get: function(mid) {
			return (this.isSet(mid) ? this.mangas[mid] : 0);
		},
		/**
		 * Set the manga status with the appropriate value. If the value is 0, the status is unset instead to free up memory space
		 * @param {integer} mid - Id of the manga to set
		 * @param {Mangas.Status ENUM} - Status of the manga to set
		 */
		set: function(mid, value) {
			if (value == 0) {
				this.unset(mid);
			} else {
				this.mangas[mid] = value;
			}
		},
		/**
		 * Remove the specified manga status
		 * @param {integer} mid - Id of the manga to unset
		 */
		unset: function(mid) {
			if (this.isSet(mid)) {
				delete this.mangas[mid];
			}
		},
		/** Save the status in localstorage */
		save: function() {
			let cmprs = this.compress(this.mangas);
			if (cmprs != null) {
				this.saveMethod().set({"fk-status": cmprs});
			}
		},
		/** Clear the status in localstorage */
		clear: function() {
			this.saveMethod().remove("fk-status");
		},
		/** Determine the save method depending on the browser */
		saveMethod: function() {
			return (navigator.userAgent.indexOf("Firefox") != -1 ? chrome.storage.local : chrome.storage.sync);
		}
	},
	/**
	 * Check if the user is connected to KissManga
	 * @return {boolean} True if user is connected, false otherwise
	 */
	isUserConnected: function() {
		return ($("#aDropDown").length > 0);
	},
	initializing: false,
	optionsLoaded: false,
	statusLoaded: false,
	loadCallbacks: [],
	blockCallbacks: [],
	/**
	 * Used to initialize the data in localstorage. Any method can be used in the callback (as everything will be loaded)
	 * @param {function} callback - Callback to call once FreeKiss is initialized
	 * @param {boolean} block - If block is true, the callback will not be called if Options.disable is true
	 */
	init: function(callback, block = true) {
		if (block) {
			this.blockCallbacks.push(callback);
		} else {
			this.loadCallbacks.push(callback);
		}
		if (!this.initializing) {
			this.initializing = true;

			this.optionsLoaded = false;
			this.Options.init(this);
			this.statusLoaded = false;
			this.Status.init(this);			
		}
	},
	/** Called by the subclasses once they are initialized */
	loaded: function() {
		// Once all the data is loaded, we execute the callback if FreeKiss is enabled
		if (this.optionsLoaded && this.statusLoaded) {
			this.initializing = false;
			for (let i = 0; i < this.loadCallbacks.length; i++) {
				this.loadCallbacks[i]();
			}
			this.loadCallbacks = [];
			if (this.Options.get("disable") === false) {
				for (let i = 0; i < this.blockCallbacks.length; i++) {
					this.blockCallbacks[i]();
				}
			}
			this.blockCallbacks = [];
		}
	},
	/**
	 * Contact the background page to update FreeKiss' icon unread counter
	 * @param {Bookmarks} bookmarks - Reference to a synchronized Bookmarks class
	 * @param {Boolean} refreshAlarm - If true, the background page's alarm is refreshed. (Should be set as false if the bookmarks are not freshly updated)
	 */
	updateIcon: function(bookmarks, refreshAlarm) {
		if (this.Options.get("showUnreadOnIcon") === true) {
			chrome.runtime.sendMessage({message: "UpdateIcon", freekiss: this, bookmarks: bookmarks, refreshAlarm: refreshAlarm});
		}
	}
};

/** Prevent onclick ads on KissManga from firing. */
if (window.location.hostname == "kissmanga.com") {
	var script = document.createElement('script');
	script.textContent = "var f=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,fn,capture){this.f=f;if(!/b\\(['\"]\\w+['\"]\\)/g.test(fn.toString())){this.f(type,fn,capture);}};";
	(document.head || document.documentElement).appendChild(script);
	script.remove();
}
