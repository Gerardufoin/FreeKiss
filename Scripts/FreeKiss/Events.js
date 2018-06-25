"use strict";

// Enable the debug logs
var DEBUG = true;
// Minimum refresh rate of the alarm to avoid users forcing a lower value and flooding KissManga of requests
var MIN_TIMER_VALUE = 1;
// Refresh rate of the loading animation on FreeKiss' icon
var LOADING_DISPLAY_INTERVAL = 200;
// Waiting time in seconds for Cloudflare
var CLOUDFLARE_TIMEOUT = 10;

// ID of the interval used for the loading animation
var loadingID = null;
// Current progression of the loading animation
var loadingProgress = 1;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!request.message) return;

	if (request.message == "ApplyOptions") {
		ApplyOptions((typeof(request.updateIcon) === "boolean" ? request.updateIcon : false));
	}
	if (request.message == "UpdateIcon" && request.hasOwnProperty('freekiss') && request.hasOwnProperty('bookmarks')) {
		// Function cannot be passed through json so the prototype for the get functions are readded here
		request.freekiss.Options.get = function(property) {
			return (this.options != null && this.options.hasOwnProperty(property) ? this.options[property] : null);
		};
		request.freekiss.Status.get = function(mid) {
			return (this.mangas != null && this.mangas.hasOwnProperty(mid) ? this.mangas[mid] : 0);
		};
		UpdateIcon(request.freekiss, request.bookmarks);
		if (request.hasOwnProperty("refreshAlarm") && request.refreshAlarm === true) {
			RefreshAlarm();
		}
	}
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
	ClearLoading();
	let unread = 0;
	let statusOn = FreeKiss.Options.get("bookmarksSorting");
	for (var key in Bookmarks.mangas) {
		if (Bookmarks.mangas.hasOwnProperty(key) && !Bookmarks.mangas[key].read &&
			(!statusOn || FreeKiss.Status.get(key) == Mangas.Status.NONE)) {
			++unread;
		}
	}
	// Cannot display more than 3 characters on a badge
	if (unread > 999) {
		unread = 999;
	}
	chrome.browserAction.setBadgeBackgroundColor({color: [61, 160, 67, 255]});
	chrome.browserAction.setBadgeText({text: (unread > 0 ? "" + unread : "")});
	LogDebug("Icon updated: " + unread + " unread chapters.");
}

/**
 * Check FreeKiss' options to see if the showUnreadOnIcon option needs to be started or canceled.
 * @param {Boolean} showUnread - If set to true, FreeKiss' icon is immediately updated (default behavior)
 */
function ApplyOptions(showUnread = true) {
	FreeKiss.init(() => {
		if (FreeKiss.Options.get("showUnreadOnIcon") === true) {
			if (showUnread) ShowUnreadBookmarks();
			RefreshAlarm();
		} else {
			RemoveAlarm();
			ResetIcon();
		}
	}, true);
}

/** Check the bookmarks page to get the unread bookmarks and then call UpdateIcon */
function ShowUnreadBookmarks() {
	DisplayLoading();
	Bookmarks.sync(() => {
		UpdateIcon(FreeKiss, Bookmarks);
	}, false, (code) => {
		// If the request fail with a 503, it's probably because of Cloudflare, so we kindly ask him for some good cookies
		if (code == 503) {
			RefreshCfCookies();
		} else {
			ResetIcon();
			LogDebug("Unable to access the bookmarks for unknown reason. If it seems anormal, you can report this issue on the extension page in the chrome store.");
		}
	});
}

/** Make the text on FreeKiss' icon change to an animation of three dots on an orange background */
function DisplayLoading() {
	ClearLoading();
	chrome.browserAction.setBadgeBackgroundColor({color: [255, 140, 0, 255]});
	chrome.browserAction.setBadgeText({text: "."});
	loadingProgress = 1;
	loadingID = setInterval(LoadingLoop, LOADING_DISPLAY_INTERVAL);
}

/** Clear the loading animation' interval */
function ClearLoading() {
	if (loadingID) {
		clearInterval(loadingID);
	}
}

/** Called by the animation' interval */
function LoadingLoop() {
	if (++loadingProgress > 3) {
		loadingProgress = 1;
	}
	chrome.browserAction.setBadgeText({text: ".".repeat(loadingProgress)});
}

/** Get the timer value from FreeKiss' options (The value cannot be below MIN_TIMER_VALUE to prevent spamming KissManga) */
function GetRefreshRate() {
	let rate = FreeKiss.Options.get("showUnreadRefreshRate");

	if (typeof rate === "string") {
		rate = parseInt(rate);
	}
	if (!Number.isInteger(rate) || rate < MIN_TIMER_VALUE) {
		rate = MIN_TIMER_VALUE;
	}
	LogDebug("Refresh rate: " + rate);
	return rate;
}

/** Refresh the alarm */
function RefreshAlarm() {
	let rate = GetRefreshRate();
	LogDebug("New alarm started.");
	chrome.alarms.create('UpdateIcon', {periodInMinutes: rate});
}

/** Remove the ongoing alarm */
function RemoveAlarm() {
	chrome.alarms.clear('UpdateIcon');
}

/** Reset FreeKiss' icon */
function ResetIcon() {
	ClearLoading();
	chrome.browserAction.setBadgeText({text: ""});
}

/** Callback when an alarm is triggered */
function onAlarm(alarm) {
	LogDebug("Alarm triggered.");
	FreeKiss.init(() => {
		ShowUnreadBookmarks();
		RefreshAlarm();
	}, true);
}

/** Refresh the cloudflare's cookies and retry to access the bookmarks list. If it does not work, you can start cursing. */
function RefreshCfCookies() {
	LogDebug("Refreshing Cloudflare cookies.");
	$("body").append("<iframe id='frame' width='0' height='0' src='http://kissmanga.com'></iframe>");
	// we wait for 6 seconds for cloudflare to do his things before removing the iframe
	setTimeout(() => {
		$("#frame").remove();
		// It's possible that the showUnreadOnIcon was disabled during those 6 seconds (awkward), so we check again
		if (FreeKiss.Options.get("showUnreadOnIcon")) {
			Bookmarks.sync(null, false, (code) => {
				// If the contact fail again, we bail
				ResetIcon();
				LogDebug("Unable to access bookmarks for the second time. Retrying later.");
			});
		}
	}, CLOUDFLARE_TIMEOUT * 1000);
}

/**
 * Log a debug message in the console with the current time.
 * @param {String} message - The message to display.
 */
function LogDebug(message) {
	if (DEBUG) {
		console.log("[FreeKiss - " + new Date().toISOString().substr(11, 8) + "]: " + message);		
	}
}

chrome.runtime.onInstalled.addListener(ApplyOptions);
chrome.runtime.onStartup.addListener(ApplyOptions);
chrome.alarms.onAlarm.addListener(onAlarm);


/** Used to remove X-Frame-Options header. Cloudflare doesn't want to cooperate otherwise. */
chrome.webRequest.onHeadersReceived.addListener(
	(info) => {
		let headers = info.responseHeaders;
		let index = headers.findIndex(x => x.name.toLowerCase() == "x-frame-options");
		if (index != -1) {
			headers.splice(index, 1);
		}
		return {responseHeaders: headers};
	},
	{
		urls: ['*://kissmanga.com/*'],
		types: ['sub_frame']
	},
	['blocking', 'responseHeaders']
);

/** Block the access to harmful providers of onclick ads popups. */
chrome.webRequest.onBeforeRequest.addListener(
    () => {
        return {cancel: true};
    },
    {
        urls: ["*://deloton.com/*", "*://cobalten.com/*"]
    },
    ["blocking"]
);
