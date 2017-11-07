"use strict";

var Format = {
	TEXT: 0,
	XML: 1,
	JSON: 2
};

function DownloadFile(filename, text) {
	let link = '<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(text) + '" download="' + filename + '" style="display:none;"></a>';
	$(link)[0].click();
}

function ShowFormats() {
	$("#formats button").removeClass("fk-hide");
	$(".fk-imgLoader").addClass("fk-hide");
}

function HideFormats() {
	$("#formats button").addClass("fk-hide");
	$(".fk-imgLoader").removeClass("fk-hide");
}

function ShowPreview(content, ext) {
	$("#preview").removeClass("fk-hide");
	$("#previewContent").text(content);
	$("#previewExt").text(ext);
}

function HidePreview() {
	$("#preview").addClass("fk-hide");
	$("#previewContent").text("");
}

function ChooseFormat(format) {
	HideFormats();
	HidePreview();
	// We synchronize the bookmarks with syncOnce at true to avoid pulling them every time
	Bookmarks.sync(() => {
		let bookmarks = Bookmarks.fetchAll();
		ShowFormats();
		switch (format) {
			case Format.XML:
				ShowPreview("XML", "xml");
				break;
			case Format.JSON:
				ShowPreview("JSON", "json");
				break;
			default:
				ShowPreview(SortBookmarks(bookmarks), "txt");
		}
	}, true);
}

function Init() {
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

		$("#previewDownload").click(() => {
			DownloadFile("Kissmanga-Bookmarks." + $("#previewExt").text(), $("#previewContent").text());
		});
	});
}

FreeKiss.init(Init, false);

function SortBookmarks(bkmarks) {
	let sorted = {
		reading: [],
		completed: [],
		onHold: [],
		planToRead: []
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
	sorted.completed.sort();
	sorted.onHold.sort();
	sorted.planToRead.sort();

	return JSON.stringify(sorted);
}