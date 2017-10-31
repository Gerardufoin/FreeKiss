"use strict";

function DownloadFile(filename, text) {
	let link = '<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(text) + '" download="' + filename + '" style="display:none;"></a>';
	$(link)[0].click();
}

function Init() {
	$(document).ready(function() {
		Bookmarks.sync(() => {
			console.log(Bookmarks.fetchAll());
			DownloadFile("text.txt", "hello");
		});
	});
}

FreeKiss.init(Init, false);