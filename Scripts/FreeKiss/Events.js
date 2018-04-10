"use strict";

// Minimum refresh rate of the alarm to avoid users forcing a lower value and flooding KissManga of requests
var MIN_TIMER_VALUE = 1;
// Refresh rate of the loading animation on FreeKiss' icon
var LOADING_DISPLAY_INTERVAL = 200;

// ID of the interval used for the loading animation
var loadingID = null;
// Current progression of the loading animation
var loadingProgress = 1;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!request.message) return;

	if (request.message == "ApplyOptions") {
		ApplyOptions((typeof(request.updateIcon) === "boolean" ? request.updateIcon : false));
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
	for (var key in Bookmarks.mangas) {
		if (Bookmarks.mangas.hasOwnProperty(key) && !Bookmarks.mangas[key].read && FreeKiss.Status.get(key) == Mangas.Status.NONE) {
			++unread;
		}
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

/**
 * Log a debug message in the console with the current time.
 * @param {String} message - The message to display.
 */
function LogDebug(message) {
	console.log("[FreeKiss - " + new Date().toISOString().substr(11, 8) + "]: " + message);
}

chrome.runtime.onInstalled.addListener(ApplyOptions);
chrome.runtime.onStartup.addListener(ApplyOptions);
chrome.alarms.onAlarm.addListener(onAlarm);
