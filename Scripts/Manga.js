"use strict";

function Manga() {
	// If the manga manager is disabled, we do nothing
	if (FreeKiss.Options.get("mangaManager") == false) return;

	Management.Synchronize();
	
	// Using mutations allow the data to change at page load for a smooth display
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {

			// We check all the <p> mutation to find the addition of #spanBookmarkManager
			if ($(mutation.target).prop("tagName") == "P") {
				mutation.addedNodes.forEach(function(node) {
					if (node.id === "spanBookmarkManager") {
						let link = $(mutation.target).parent('div').find('a:first-child');
						$(node).before(Management.CreateManager($(link).text(), $(link).attr("href").substring(1)));
						$(node).remove();
					}
				});
			}
			
			// We get the manga id from the page script
			if ($(mutation.target).prop("tagName") == "SCRIPT") {
				mutation.addedNodes.forEach(function(node) {
					let mid = $(node).text().match(/mangaID=(\d+)/);
					if (mid != null) {
						$(".fk-mAdd").attr("mid", mid[1]);
					}
				});
			}

			// Add the OnHold display (hidden by default)
			if (FreeKiss.Options.get("bookmarksSorting") == true) {
				if (mutation.target.id == "rightside") {
					mutation.addedNodes.forEach(function(node) {
						let image = $(node).find("img:only-child");
						if (image != undefined) {
							$(image).parent('div').addClass("fk-makeRelative");
							$(image).after('<div class="fk-onHoldDisplay fk-hide">On Hold</div><div class="fk-planToReadDisplay fk-hide">Plan To Read</div>');
						}
					});
				}
			}
		});
	});

	observer.observe(document,
		{
			attributes: false,
			attributeOldValue: false,
			childList: true,
			characterData: false,
			subtree: true
		}
	);
}

FreeKiss.init(Manga);