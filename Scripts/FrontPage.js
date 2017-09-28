"use strict";

function FrontPage() {
	// If the frontpage managers are disabled, we do nothing
	if (FreeKiss.Options.get("frontpageManager") == false) return;

	Bookmarks.sync(function() {
		$(".fk-management").each(function() {
			UpdateBookmarkManagement(this);
		});
	});

	// Using mutations allow the data to change at page load AND to update new datas when kissmanga adds mangas in the scrollbar
	var observer = new MutationObserver(function(mutations) {
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
					// Add the OnHold display (hidden by default)
					if (FreeKiss.Options.get("bookmarksSorting") == true) {
						$(node).find('a > img').after('<div class="fk-onHoldSubdisplay fk-hide">On Hold</div>');
					}
					// Add the manager
	  				var manager = CreateBookmarkManagementNode($(node).find("span.title").text(), $(node).find("a:first-child").attr("href"));
	  				manager.addClass("fk-submenuManagement");
	  				$(node).append(manager);
	  			}
	  		});
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

// Wrap the manager around a manga node
function WrapManager(node) {
	$(node).find("img:first-child").width(130); // Scrollable added by ajax request have a 120px width instead of 130px...
	$(node).wrap('<div class="fk-scrollingWrapper"></div>');
	$(node).addClass("fk-makeRelative");

	// Add the OnHold display (hidden by default)
	if (FreeKiss.Options.get("bookmarksSorting") == true) {
		$(node).append('<div class="fk-onHoldDisplay fk-hide">On Hold</div>');
	}

	// Add the manager
	$(node).before(CreateBookmarkManagementNode($(node).contents().filter(function() { return this.nodeType == Node.TEXT_NODE; }).text(), $(node).attr("href")));
}

FreeKiss.init(FrontPage);