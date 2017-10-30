var Mangas = {
	Status: {
		NONE: 0,
		ON_HOLD: 1,
		PLAN_TO_READ: 2
	}
};

// FreeKiss class. Manage the relation between FreeKiss and the localstorage (options, bookmarks status, etc.)
// Every script should put its main function in init to check if FreeKiss is disabled
var FreeKiss = {
	// Option subclass. Allow to manipulate FreeKiss options
	Options: {
		// Default options
		options: {
			frontpageManager: true,
			mangaManager: true,
			chapterManager: true,
			enhancedDisplay: true,
			bookmarksSorting: true,
			maxPageWidth: 800,
			maxDoublePageWidth: 1800,
			minPageWidth: 600,
			minDoublePageWidth: 1000,
			maxDisable: false,
			minDisable: false,
			disable: false
		},
		// Use init to load the options.
		init: function(fk) {
			var obj = this;
			chrome.storage.local.get("fk-options", function(opt) {
				if (opt['fk-options'] != null && Object.keys(opt['fk-options']).length > 0) {
					obj.options = opt['fk-options'];
				}
				fk.optionsLoaded = true;
				fk.loaded();
			});
		},
		// Check if the option is set
		isSet: function(property) {
			return (this.options != null && this.options.hasOwnProperty(property));
		},
		// Return the option value or null if the option does not exist
		get: function(property) {
			return (this.isSet(property) ? this.options[property] : null);
		},
		// Set the property in the options with the appropriate value
		set: function(property, value) {
			this.options[property] = value;
		},
		// Save the options in localstorage
		save: function() {
			chrome.storage.local.set({"fk-options": this.options});
		},
		// Clear the options in localstorage
		clear: function() {
			chrome.storage.local.remove("fk-options");
		}
	},
	// Manga Status subclass. Allow to manipulate mangas status
	Status: {
		mangas: {},
		// Use init to load the status.
		init: function(fk) {
			var obj = this;
			chrome.storage.sync.get("fk-status", function(opt) {
				if (opt['fk-status'] != null && Object.keys(opt['fk-status']).length > 0) {
					let st = obj.decompress(opt['fk-status']);
					if (st != null) obj.mangas = st;
				}
				fk.statusLoaded = true;
				fk.loaded();
			});
		},
		// Compress json with lz-string. Return null if invalid
		compress: function(json) {
			try {
				return LZString.compress(JSON.stringify(json));
			} catch(e) {
				console.error("Unable to compress status json.");
				return null;
			}
		},
		// Decompress json with lz-string. Return null if invalid
		decompress: function(data) {
			try {
				return JSON.parse(LZString.decompress(data));
			} catch(e) {
				console.error("Unable to decompress status json.");
				return null;
			}
		},
		// Check if the manga has a status
		isSet: function(mid) {
			return (this.mangas != null && this.mangas.hasOwnProperty(mid));
		},
		// Return the status value or 0 if the manga does not have a status
		get: function(mid) {
			return (this.isSet(mid) ? this.mangas[mid] : 0);
		},
		// Set the manga status with the appropriate value. If the value is 0, the status is unset instead to free up memory space
		set: function(mid, value) {
			if (value == 0) {
				this.unset(mid);
			} else {
				this.mangas[mid] = value;
			}
		},
		// Remove the specified manga status
		unset: function(mid) {
			if (this.isSet(mid)) {
				delete this.mangas[mid];
			}
		},
		// Save the status in localstorage
		save: function() {
			let cmprs = this.compress(this.mangas);
			if (cmprs != null) {
				chrome.storage.sync.set({"fk-status": cmprs});
			}
		},
		// Clear the status in localstorage
		clear: function() {
			chrome.storage.sync.remove("fk-status");
		}
	},
	// Return a boolean (true if user is connected)
	isUserConnected: function() {
		return ($("#aDropDown").length > 0);
	},
	optionsLoaded: false,
	statusLoaded: false,
	loadCallbacks: [],
	blockCallbacks: [],
	// Used to initialize the data in localstorage. Any method can be used in the callback (as the everything will be loaded)
	init: function(callback, block = true) {
		if (block) {
			this.blockCallbacks.push(callback);
		} else {
			this.loadCallbacks.push(callback);
		}
		this.Options.init(this);
		this.Status.init(this);
	},
	loaded: function() {
		// Once all the data is loaded, we execute the callback if FreeKiss is enabled
		if (this.optionsLoaded && this.statusLoaded) {
			for (var i = 0; i < this.loadCallbacks.length; i++) {
				this.loadCallbacks[i]();
			}
			this.loadCallbacks = [];
			if (this.Options.get("disable") === false) {
				for (var i = 0; i < this.blockCallbacks.length; i++) {
					this.blockCallbacks[i]();
				}
			}
			this.blockCallbacks = [];
		}
	}
};
