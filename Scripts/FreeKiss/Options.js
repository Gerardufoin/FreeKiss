"use strict";

/** Main function, called after FreeKiss is loaded */
function Options() {
	$(document).ready(function() {
		SetRefreshRateDisplay();

		// All the boolean options are formatted the same way for genericityù
		$("input[type='checkbox']").each(function() {
			$(this).prop("checked", FreeKiss.Options.get($(this).attr("name")));
		});

		$("input[type='checkbox']").change(function() {
			FreeKiss.Options.set($(this).attr("name"), $(this).prop("checked"));
			FreeKiss.Options.save();

			if ($(this).attr("name") == "showUnreadOnIcon") {
				SetRefreshRateDisplay();
				UpdateEventPage(true);
			}
		});

		$("#refreshRate").change(function() {
			FreeKiss.Options.set($(this).attr("name"), this.value);
			FreeKiss.Options.save();
			UpdateEventPage(false);
		});
	});
}

function SetRefreshRateDisplay() {
	if (FreeKiss.Options.get("showUnreadOnIcon")) {
		$(".showUnreadDependent").removeClass("fk-hide");
	} else {
		$(".showUnreadDependent").addClass("fk-hide");
	}
}

function UpdateEventPage(updateIcon) {
	chrome.runtime.sendMessage({message: "ApplyOptions", updateIcon: updateIcon});
}

FreeKiss.init(Options, false);