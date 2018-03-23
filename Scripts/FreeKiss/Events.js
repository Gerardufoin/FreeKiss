"use strict";

// Legacy support for pre-event-pages (Chrome version < 22)
var oldChromeVersion = !chrome.runtime;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	FreeKiss.init(() => {
		Bookmarks.sync(() => {
			UpdateIcon(FreeKiss, Bookmarks);
		});
	});
});

/**
 * Updates FreeKiss's icon to display the number of unread chapters. The FreeKiss and Bookmarks classes are passed as
 * parameters as the function will have to be called when a bookmarks' status is changed (and the classes will be transfered through a message.
 * This prevents having to update them every single time, which is super slow).
 * @param {FreeKiss} FreeKiss - Reference to an initiated FreeKiss instance
 * @param {Bookmarks} Bookmarks - Reference to a synchronized Bookmarks instance
 */
function UpdateIcon(FreeKiss, Bookmarks)
{
	let unread = 0;
	for (var key in Bookmarks.mangas) {
		if (Bookmarks.mangas.hasOwnProperty(key) && !Bookmarks.mangas[key].read && FreeKiss.Status.get(key) == Mangas.Status.NONE) {
			++unread;
		}
	}
	chrome.browserAction.setBadgeBackgroundColor({color: [61, 160, 67, 255]});
	chrome.browserAction.setBadgeText({text: (unread > 0 ? "" + unread : "")});
	console.log("Icon updated: " + unread + " unread chapters.");
}