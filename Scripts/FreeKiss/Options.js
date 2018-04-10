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

			// If the option is to display the unread bookmarks on the icon, we show the refresh rate
			if ($(this).attr("name") == "showUnreadOnIcon") {
				SetRefreshRateDisplay();
				UpdateEventPage(true);
			}
		});

		// Save the new refresh rate on change. Will update the alarm but not refresh the icon
		$("#refreshRate").change(function() {
			FreeKiss.Options.set($(this).attr("name"), this.value);
			FreeKiss.Options.save();
			UpdateEventPage(false);
		});
	});
}

/** Show or hide the refresh rate select. Update the selected value based on the value saved in FreeKiss' options. */
function SetRefreshRateDisplay() {
	if (FreeKiss.Options.get("showUnreadOnIcon")) {
		$(".showUnreadDependent").removeClass("fk-hide");
		let select = $("#refreshRate");
		select.val(FreeKiss.Options.get(select.attr("name")));
	} else {
		$(".showUnreadDependent").addClass("fk-hide");
	}
}

/**
 * Call the background event script to update the options.
 * @param {Boolean} updateIcon - If true, the call also refresh the displayed value on FreeKiss' icon
 */
function UpdateEventPage(updateIcon) {
	chrome.runtime.sendMessage({message: "ApplyOptions", updateIcon: updateIcon});
}

FreeKiss.init(Options, false);