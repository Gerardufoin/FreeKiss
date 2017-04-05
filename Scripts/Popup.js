"use strict";

$(document).ready(function() {

	chrome.storage.local.get("fk-options", function(options) {
		options = options['fk-options'];
		if (options == null) {
			options = {};
		}

		if (options.hasOwnProperty('disable') && options.disable)
		{
			$("#disable").addClass("active").text("Enable FreeKiss");
		}

		$("#disable").click(function() {
			$(this).toggleClass("active");
			if ((options.disable = $(this).hasClass("active"))) {
				$(this).text("Enable FreeKiss");
			} else {
				$(this).text("Disable FreeKiss");
			}
			chrome.storage.local.set({"fk-options": options});
		});
	});

});
