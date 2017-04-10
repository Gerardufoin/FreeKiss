"use strict";

var fk_test_image = new Image();

function Chapter() {
	Mutations();
}

function Mutations() {
	// Mutation are used to get the images as they are added to the page to resize them
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
	  	// All images are in the #divImage element
	  	if (mutation.target.id == "divImage") {
		  	mutation.addedNodes.forEach(function(node) {
		  		// If the node is an element (1) we apply the onLoad (could be a text (3))
		  		if (node.nodeType == 1) {
		  			$(node).find("img").on('load', function() {
						FK_ApplyResizeOptions($(this));
					});
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

Options.init(Chapter);

// Resize of the image depending on the options and if it's a double-page or not
function FK_ApplyResizeOptions(img) {
	fk_test_image.src = img.attr("src");

	if (!FK_IsDoublePage(fk_test_image)) {
		if (Options.isSet("maxPageWidth")) {
			img.css("max-width", parseInt(Options.getValue("maxPageWidth")));
		}
		if (Options.isSet("minPageWidth")) {
			img.css("min-width", parseInt(Options.getValue("minPageWidth")));
		}
	} else {
		if (Options.isSet("maxDoublePageWidth")) {
			img.css("max-width", parseInt(Options.getValue("maxDoublePageWidth")));
		}
		if (Options.isSet("minDoublePageWidth")) {
			img.css("min-width", parseInt(Options.getValue("minDoublePageWidth")));
		}
	}
}

// This function is called by Popup.js when the options are changed
function FK_PageResize(attribute, value) {

	$("#divImage p > img").each(function() {
		fk_test_image.src = $(this).attr("src");

		switch(attribute) {
			case "maxPageWidth":
				if (!FK_IsDoublePage(fk_test_image)) $(this).css("max-width", value);
				break;
			case "maxDoublePageWidth":
				if (FK_IsDoublePage(fk_test_image)) $(this).css("max-width", value);
				break;
			case "minPageWidth":
				if (!FK_IsDoublePage(fk_test_image)) $(this).css("min-width", value);
				break;
			case "minDoublePageWidth":
				if (FK_IsDoublePage(fk_test_image)) $(this).css("min-width", value);
				break;
		}
	});
}

// Check if the image is a double-page
function FK_IsDoublePage(img) {
	return (img.naturalWidth >= img.naturalHeight);
}