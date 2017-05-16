// Option class. Allow to manipulate FreeKiss options
// Every script should put its main function in init to check if FreeKiss is disabled
var Options = {
	// Default options
	options: {
		frontpageManager: true,
		enhancedDisplay: true,
		maxPageWidth: 800,
		maxDoublePageWidth: 1800,
		minPageWidth: 600,
		minDoublePageWidth: 1000,
		maxDisable: false,
		minDisable: false,
		disable: false
	},
	// Use init to load the options. Any method can be used in the callback (as the options will be loaded)
	init: function(callback, block = true) {
		var obj = this;
		chrome.storage.local.get("fk-options", function(opt) {
				if (opt['fk-options'] != null && Object.keys(opt['fk-options']).length > 0) {
					obj.options = opt['fk-options'];
				}
				// If FreeKiss is disable and the block parameter is ON, we do not load the callback
				if (!block || obj.get("disable") === false) {
					callback();
				}
			}
		);
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
};
