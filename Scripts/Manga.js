"use strict";

function Manga() {
	Bookmarks.sync(function() {
		$(".fk-management").each(function() {
			UpdateBookmarkManagement(this);
		});
	});

	// Using mutations allow the data to change at page load for a smooth display
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {

	  	// We check all the <p> mutation to find the addition of #spanBookmarkManager
	  	if ($(mutation.target).prop("tagName") == "P") {
		  	mutation.addedNodes.forEach(function(node) {
		  		if (node.id === "spanBookmarkManager") {
		  			let link = $(mutation.target).parent('div').find('a:first-child');
		  			$(node).before(CreateBookmarkManagementNode($(link).text(), $(link).attr("href").substring(1)));
		  			$(node).remove();
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

FreeKiss.init(Manga);