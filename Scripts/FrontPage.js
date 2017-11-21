"use strict";

/** Main function of the frontpage. Needs to be called after FreeKiss has been loaded */
function FrontPage() {
	// If the frontpage managers are disabled, we do nothing
	if (FreeKiss.Options.get("frontpageManager") == false) return;

	Management.Synchronize();

	// Using mutations allow the data to change at page load AND to update new datas when kissmanga adds mangas in the scrollbar
	new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {

			// We add the fk-scrollable class on the scrollbar (not the prettiest way of doing it)
			if (mutation.target.className == "scrollable") {
				$(mutation.target).addClass("fk-scrollable");
			}

			// Add bookmark notifications in the scrollbar
			if (mutation.target.className == "items") {
				// Search through all the nodes of the mutation with the class "items" (divs inside the scrollbar)
				mutation.addedNodes.forEach(function(node) {
					// We mark the node in case links are added afterwards
					$(node).addClass("fk-scrollBundle");
					// One last check to avoid unneeded mutations
					if (node.childNodes.length > 0) {
						$(node).find("a").each(function() {
							WrapManager($(this));
						});
					}
				});
			}

			// Sometimes some manga nodes are added afterwards. This is here to get them and add the manager.
			if (mutation.target.className == "fk-scrollBundle") {
				mutation.addedNodes.forEach(function(node) {
					if (!$(node).hasClass("fk-makeRelative") && $(node).is("a")) {
						WrapManager($(node));
					}
				});
			}

			// Add bookmark management in the submenus (most-popular/new-manga)
			if (mutation.target.id == "tab-newest" || mutation.target.id == "tab-mostview") {
				mutation.addedNodes.forEach(function(node) {
					if (node.childNodes.length == 5) {
						// Add the manager
						var manager = Management.CreateManager($(node).find("span.title").text(), $(node).find("a:first-child").attr("href"), $(node).find('a:first-child'));
						manager.addClass("fk-submenuManagement");
						$(node).append(manager);
					}
				});
			}

		});
	}).observe(document, {childList: true, subtree: true});
}

/**
 * Wrap the manager around a manga node
 * @param {jQuery Node} node - DOM element containing the tageted manga
 */
function WrapManager(node) {
	$(node).find("img:first-child").width(130); // Scrollable added by ajax request have a 120px width instead of 130px...
	$(node).wrap('<div class="fk-scrollingWrapper"></div>');
	$(node).addClass("fk-makeRelative");

	// Add the manager
	$(node).before(Management.CreateManager($(node).contents().filter(function() { return this.nodeType == Node.TEXT_NODE; }).text(), $(node).attr("href"), $(node)));
}

FreeKiss.init(FrontPage);