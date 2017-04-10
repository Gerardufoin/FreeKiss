"use strict";

// Option class. Allow to manipulate FreeKiss options
// Every script should put its main function in init to check if FreeKiss is disabled
var Options = {
	options: null,
	// Use init to load the options. Any method can be used in the callback (as the options will be loaded)
	init: function(callback) {
		var obj = this;
		chrome.storage.local.get("fk-options", function(opt) {
				obj.options = opt['fk-options'];
				// If FreeKiss is disable, we do not load the callback
				if (obj.getValue("disable") === false) {
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
	getValue: function(property) {
		return (this.isSet(property) ? this.options[property] : null);
	}
};

function FreeKiss() {

	$(document).ready(function () {

		// Make username directly lead to bookmarks
		$("#aDropDown").attr("href", "http://kissmanga.com/BookmarkList");

	});	

}

Options.init(FreeKiss);
