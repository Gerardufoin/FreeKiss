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
				ShowPreview("TEXT", "txt");
		}
	});
}

function Init() {
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