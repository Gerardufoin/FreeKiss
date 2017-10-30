"use strict";

// Variable used to get images height/width. Created here to avoid spamming "new"
var fk_test_image = new Image();

function Chapter() {
	if (FreeKiss.Options.get("chapterManager")) {
		Management.Synchronize();
	}
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

			// Add the manager
			if (FreeKiss.Options.get("chapterManager") && $(mutation.target).prop("tagName") == "DIV") {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType == 1 && $(node).prev().attr("id") == "headnav") {
						let info = $('div#navsubbar p a');
						$(node).prepend(Management.CreateManager($(info).parent().text().split('\n')[3], $(info).attr("href").replace("http://kissmanga.com/", "")));
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

FreeKiss.init(Chapter);

// Resize of the image depending on the options and if it's a double-page or not
function FK_ApplyResizeOptions(img) {
	fk_test_image.src = img.attr("src");

	if (!FK_IsDoublePage(fk_test_image)) {
		if (FreeKiss.Options.isSet("maxPageWidth") && FreeKiss.Options.get("maxDisable") === false) {
			img.css("max-width", parseInt(FreeKiss.Options.get("maxPageWidth")));
		}
		if (FreeKiss.Options.isSet("minPageWidth") && FreeKiss.Options.get("minDisable") === false) {
			img.css("min-width", parseInt(FreeKiss.Options.get("minPageWidth")));
		}
	} else {
		if (FreeKiss.Options.isSet("maxDoublePageWidth") && FreeKiss.Options.get("maxDisable") === false) {
			img.css("max-width", parseInt(FreeKiss.Options.get("maxDoublePageWidth")));
		}
		if (FreeKiss.Options.isSet("minDoublePageWidth") && FreeKiss.Options.get("minDisable") === false) {
			img.css("min-width", parseInt(FreeKiss.Options.get("minDoublePageWidth")));
		}
	}
}

// This function is called by Popup.js when the options are changed
function FK_PageResize(attribute, value, maxDisable, minDisable) {

	$("#divImage p > img").each(function() {
		fk_test_image.src = $(this).attr("src");

		switch(attribute) {
			case "maxPageWidth":
				if (!FK_IsDoublePage(fk_test_image) && !maxDisable) $(this).css("max-width", value);
				break;
			case "maxDoublePageWidth":
				if (FK_IsDoublePage(fk_test_image) && !maxDisable) $(this).css("max-width", value);
				break;
			case "minPageWidth":
				if (!FK_IsDoublePage(fk_test_image) && !minDisable) $(this).css("min-width", value);
				break;
			case "minDoublePageWidth":
				if (FK_IsDoublePage(fk_test_image) && !minDisable) $(this).css("min-width", value);
				break;
		}
	});
}

// Toggle the max page resize on or off depending on value
function FK_ToggleMaxWidth(disable) {
	$("#divImage p > img").each(function() {
		if (disable) {
			$(this).css("max-width", "");
		} else {
			var img = $(this);
			// Need to reload the options
			FreeKiss.init(function() {
				FK_ApplyResizeOptions(img);
			});
		}
	});
}

// Toggle the min page resize on or off depending on value
function FK_ToggleMinWidth(disable) {
	$("#divImage p > img").each(function() {
		if (disable) {
			$(this).css("min-width", "");
		} else {
			var img = $(this);
			// Need to reload the options
			FreeKiss.init(function() {
				FK_ApplyResizeOptions(img);
			});
		}
	});
}

// Check if the image is a double-page
function FK_IsDoublePage(img) {
	return (img.naturalWidth >= img.naturalHeight);
}