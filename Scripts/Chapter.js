"use strict";
var chapWidth = 0;

/** Main function of the chapter page. Needs to be called after FreeKiss has been loaded */
function Chapter() {
	// Sync the manager is required on the page, we sync the Management
	if (FreeKiss.Options.get("chapterManager")) {
		Management.Synchronize();
	}


	let injectManager = !FreeKiss.Options.get("chapterManager");
	// Mutation are used to get the images as they are added to the page to resize them and add the manager during the page load (because I'm picky)
	new MutationObserver(function(mutations) {
		// We inject the manager if #navsubbar has been added to the page
		if (!injectManager && document.getElementById("navsubbar") != undefined) {
			injectManager = true;
			let info = $('div#navsubbar p a');
			let manager = $('<div class="fk-managerWrapper"></div>').prepend(Management.CreateManager($(info).parent().text().split('\n')[3], $(info).attr("href").replace("https://kissmanga.com/", "")));
			$("#headnav").after(manager);
		}

		mutations.forEach(function(mutation) {
			// All images are in the #divImage element
			if (mutation.target.id == "divImage") {
				mutation.addedNodes.forEach(function(node) {
					if (node.tagName == "P") {
                        $.map($(node).find("img"), (img, i) => { FK_ApplyResizeOptions($(img)); });
                    } else if (node.tagName == "DIV") { //Add support of other image style
                        $.map($(node).find("img"), (img, i) => { FK_ApplyResizeOptions($(img)); });
                    }
				});
			}

			// We remove the apu.php script as it prevents user to access the chat if the onclick ad has not been clicked.
			if (mutation.target.tagName == "BODY") {
				mutation.addedNodes.forEach(function(node) {
					if (node.tagName === "SCRIPT" && node.getAttribute('src') != undefined && node.getAttribute('src').includes("apu.php")) {
						mutation.target.removeChild(node);
					}
				});
			}
		});
	}).observe(document, {childList: true, subtree: true});

	$(document).ready(function() {
		if (FreeKiss.Options.get("chapterManager")) {
			// We get the manga id for the manager from one of the scripts
			$.map($("script"), function(node, i) {
				let mid = $(node).text().match(/mangaID=(\d+)/);
				if (mid != null) {
					$(".fk-mAdd").attr("mid", mid[1]);
				}
			});
		}
		if (FreeKiss.Options.get("showComments")) {
			$('#btnShowComments')[0].click();
		}
	});
}

FreeKiss.init(Chapter);

/**
 * Resize of the image depending on the options and if it's a double-page or not
 * @param {jQuery Node} img - Image to resize
 */
function FK_ApplyResizeOptions(img) {
	if (!$(img)[0].naturalWidth) {
		setTimeout(() => { FK_ApplyResizeOptions(img); }, 50);
		return;
	}
	if (!FK_IsDoublePage($(img)[0])) {
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

/**
 * This function is called by Popup.js when the options are changed
 * @param {string} attribute - Name of the attribute modified
 * @param {number} value - New value of the attribute
 * @param {boolean} maxDisable - True if the max resize option is enabled, false otherwise
 * @param {boolean} minDisable - True if the min resize option is enabled, false otherwise
 */
function FK_PageResize(attribute, value, maxDisable, minDisable) {
	$("#divImage p > img").each(function() {
		let isDouble = FK_IsDoublePage($(this)[0]);

		switch(attribute) {
			case "maxPageWidth":
				if (!isDouble && !maxDisable) $(this).css("max-width", value);
				break;
			case "maxDoublePageWidth":
				if (isDouble && !maxDisable) $(this).css("max-width", value);
				break;
			case "minPageWidth":
				if (!isDouble && !minDisable) $(this).css("min-width", value);
				break;
			case "minDoublePageWidth":
				if (isDouble && !minDisable) $(this).css("min-width", value);
				break;
		}
	});
}

/**
 * Toggle the max page resize on or off depending on value
 * @param {boolean} disable - Set to true to enable the image max resize and fasle to disable it
 */
function FK_ToggleMaxWidth(disable) {
	$("#divImage p > img").each(function() {
		if (disable) {
			$(this).css("max-width", "");
		} else {
			// Need to reload the options
			FreeKiss.init(() => {
				FK_ApplyResizeOptions($(this));
			});
		}
	});
}

/**
 * Toggle the min page resize on or off depending on value
 * @param {boolean} disable - Set to true to enable the image min resize and fasle to disable it
 */
function FK_ToggleMinWidth(disable) {
	$("#divImage p > img").each(function() {
		if (disable) {
			$(this).css("min-width", "");
		} else {
			// Need to reload the options
			FreeKiss.init(() => {
				FK_ApplyResizeOptions($(this));
			});
		}
	});
}

/**
 * Check if the image is a double-page
 * @param {javascript node} img - The image to test
 * @return {boolean} True if image is doubled (width >= height) false otherwise
 */
function FK_IsDoublePage(img) {
	if (FK_IsRightWidth(img)){
		return false;
	}
	return (img.naturalWidth >= img.naturalHeight);
}

/**
 * Check if the image has same width as the rest of the chapter
 * @param {javascript node} img - The image to test
 * @return {boolean} True if image is same size false otherwise
 */
function FK_IsRightWidth(img) {
	/*if (typeof variable === 'undefined' || variable === null) {
		var chapWidth = 0;
	}*/
	if (chapWidth == 0) {
		chapWidth = img.naturalWidth;
	} else if (chapWidth == img.naturalWidth){
		return true;
	}
	return false;
}