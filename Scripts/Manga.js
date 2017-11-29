"use strict";

/** Main function of the manga page. Needs to be called after FreeKiss has been loaded */
function Manga() {
	// If the manga manager is disabled, we do nothing
	if (FreeKiss.Options.get("mangaManager") == false) return;

	Management.Synchronize();
	
	var addManager = false;
	var getMID = false;
	var setDisplay = false;
	// Using mutations allow the data to change at page load for a smooth display
	new MutationObserver(function(mutations, observer) {
		// Add the manager as soon as spanBookmarkManager exist
		if (!addManager && document.getElementById("spanBookmarkManager") != undefined) {
			addManager = true;
			let node = $("#spanBookmarkManager");
			let link = $(".bigChar");
			$(node).before(Management.CreateManager($(link).text(), $(link).attr("href").substring(1)));
			$(node).remove();
		}
		// Add the status display to the image
		let image;
		if (!setDisplay && document.getElementById("rightside") != undefined && (image = $("#rightside img:only-child")) != undefined) {
			setDisplay = true;
			$(image).parent('div').addClass("fk-makeRelative");
			$(image).after('<div class="fk-onHoldDisplay fk-hide">On Hold</div><div class="fk-planToReadDisplay fk-hide">Plan To Read</div>');
		}
		// We get the manga id from the page script
		if (!getMID) {
			let mid = $("script").text().match(/mangaID=(\d+)/);
			if (mid != null) {
				getMID = true;
				$(".fk-mAdd").attr("mid", mid[1]);
			}
		}

		if (addManager && getMID && setDisplay) {
			observer.disconnect();
		}
	}).observe(document, {childList: true, subtree: true});
}

FreeKiss.init(Manga);