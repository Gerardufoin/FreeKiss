"use strict";

/** Export format enum */
var Format = {
	TEXT: 0,
	XML: 1,
	JSON: 2
};

/** Show the formats choice buttons */
function ShowFormats() {
	$("#formats button").removeClass("fk-hide");
	$(".fk-imgLoader").addClass("fk-hide");
}

/** Hide the formats choice buttons */
function HideFormats() {
	$("#formats button").addClass("fk-hide");
	$(".fk-imgLoader").removeClass("fk-hide");
}

/**
 * Set the preview div content and display it to the user
 * @param {string} content - Text to display in the #preview div
 * @param {string} ext - Extension of the text format when downloaded ("txt" for text, "xml" for xml, etc...)
 */
function ShowPreview(content, ext) {
	$("#preview").removeClass("fk-hide");
	$("#previewContent").text(content);
	$("#previewDownload").attr("href", "data:application/octet-stream;charset=utf-8," + encodeURIComponent(content));
	$("#previewDownload").attr("download", "Kissmanga-Bookmarks." + ext);
}

/** Hide the #preview div */
function HidePreview() {
	$("#preview").addClass("fk-hide");
	$("#previewContent").text("");
}

/**
 * Set the content of the preview depending on the chosen format
 * @param {Format ENUM} format - Format to use for the display
 */
function ChooseFormat(format) {
	HideFormats();
	HidePreview();
	// We synchronize the bookmarks with syncOnce at true to avoid pulling them every time
	Bookmarks.sync(() => {
		let bookmarks = Bookmarks.fetchAll();
		ShowFormats();
		switch (format) {
			case Format.XML:
				ShowPreview(FormatXML(SortBookmarks(bookmarks)), "xml");
				break;
			case Format.JSON:
				ShowPreview(FormatJSON(SortBookmarks(bookmarks)), "json");
				break;
			default:
				ShowPreview(FormatText(SortBookmarks(bookmarks)), "txt");
		}
	}, true);
}

/** Main function, called after FreeKiss is loaded */
function Export() {
	Bookmarks.extended = true;
	$(document).ready(function() {
		$("#txtFormat").click(() => {
			ChooseFormat(Format.TEXT);
		});
		$("#xmlFormat").click(() => {
			ChooseFormat(Format.XML);
		});
		$("#jsonFormat").click(() => {
			ChooseFormat(Format.JSON);
		});
	});
}

FreeKiss.init(Export, false);

/**
 * Sort the bookmarks by category (reading, on hold, etc...) and return the result
 * @param {object} bkmarks - Object return by the Bookmarks class
 * @return {json} Object containing arrays (one per category) filled with the title of the bookmarks
 */
function SortBookmarks(bkmarks) {
	let sorted = {
		mangas: Object.keys(bkmarks).length,
		reading: [],
		onHold: [],
		planToRead: [],
		completed: []
	};

	for (let mid in bkmarks) {
		let bookmark = bkmarks[mid];
		let status = FreeKiss.Status.get(mid);
		if (status == Mangas.Status.ON_HOLD) {
			sorted.onHold.push(bookmark.name);
		} else if (status == Mangas.Status.PLAN_TO_READ) {
			sorted.planToRead.push(bookmark.name);
		} else if (bookmark.read == true && bookmark.completed == true) {
			sorted.completed.push(bookmark.name);
		} else {
			sorted.reading.push(bookmark.name);
		}
	}
	sorted.reading.sort();
	sorted.onHold.sort();
	sorted.planToRead.sort();
	sorted.completed.sort();

	return sorted;
}

/**
 * Format the sorted bookmarks data as text
 * @param {json} datas - Sorted bookmarks returned by the SortBookmarks function
 * @return {string} The data formated as text
 */
function FormatText(datas) {
	let text = "##### BOOKMARKS #####";
	text += "\nTotal: " + datas.mangas + " mangas";

	text += TextCategory(datas.reading, "READING");
	text += TextCategory(datas.onHold, "ON HOLD");
	text += TextCategory(datas.planToRead, "PLAN TO READ");
	text += TextCategory(datas.completed, "COMPLETED");

	return text;
}

/**
 * Format one category as text
 * @param {array} array - Array containing the bookmarks title for the selected category
 * @param {string} title - Name of the category as it should appeared for the user
 * @return {string} Formated category as text
 */
function TextCategory(array, title) {
	let text = "";

	if (array.length > 0) {
		text += "\n\n=== " + title + " (" + array.length + ") ===\n"
		text += array.join("\n") + "\n";
	}

	return text;
}

/**
 * Format the sorted bookmarks data as XML
 * @param {json} datas - Sorted bookmarks returned by the SortBookmarks function
 * @return {string} The data formated as XML
 */
function FormatXML(datas) {
	let text = '<?xml version="1.0" encoding="UTF-8"?>\n';

	text += '<Bookmarks mangas="' + datas.mangas + '">\n';
	text += XMLCategory(datas.reading, "Reading");
	text += XMLCategory(datas.onHold, "OnHold");
	text += XMLCategory(datas.planToRead, "PlanToRead");
	text += XMLCategory(datas.completed, "Completed");
	text += "</Bookmarks>\n";

	return text;
}

/**
 * Format one category as XML
 * @param {array} array - Array containing the bookmarks title for the selected category
 * @param {string} title - Name of the category as it should appeared for the user
 * @return {string} Formated category as XML
 */
function XMLCategory(array, title) {
	let text = "";

	if (array.length > 0) {
		text += '    <' + title + ' entries="' + array.length + '">\n';
		for (let i = 0; i < array.length; ++i) {
			text += "        <name>" + array[i] + "</name>\n";
		}
		text += "    </" + title + ">\n";
	}

	return text;
}

/**
 * Format the sorted bookmarks data as JSON
 * @param {json} datas - Sorted bookmarks returned by the SortBookmarks function
 * @return {string} The data formated as JSON
 */
function FormatJSON(datas) {
	return JSON.stringify(datas, null, 4);
}
