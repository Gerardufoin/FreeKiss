"use strict";

// Minimum refresh rate of the alarm to avoid users forcing a lower value and flood KissManga of requests
var MIN_TIMER_VALUE = 1;

// Legacy support for pre-event-pages (Chrome version < 22)
var oldChromeVersion = !chrome.runtime;
// Timer id of older Chrome version
var alarmTimeoutId;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	ShowUnreadBookmarks();
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

/**
 * Check FreeKiss' options to see if the showUnreadOnIcon option needs to be started or canceled.
 * @param {Boolean} showUnread - If set to true, FreeKiss' icon is immediately updated (default behavior)
 */
function ApplyOptions(showUnread = true) {
	FreeKiss.init(() => {
		if (FreeKiss.Options.get("showUnreadOnIcon") === true) {
			console.log("Option enabled and started.");
			if (showUnread) ShowUnreadBookmarks();
			RefreshAlarm();
		} else {
			console.log("Option disabled and stopped.");
			RemoveAlarm();
			ResetIcon();
		}
	}, true);
}

/**
 * Check the bookmarks page to get the unread bookmarks and then call UpdateIcon
 */
function ShowUnreadBookmarks() {
	Bookmarks.sync(() => {
		UpdateIcon(FreeKiss, Bookmarks);
	});
}

/**
 * Get the timer value from FreeKiss' options (clamped between min )
 */
function GetRefreshRate() {
	let rate = FreeKiss.Options.get("showUnreadRefreshRate");
	if (!Number.isInteger(rate) || rate < MIN_TIMER_VALUE) {
		rate = MIN_TIMER_VALUE;
	}
	console.log("Refresh rate: " + rate);
	return rate;
}

/**
 * Refresh the alarm
 */
function RefreshAlarm() {
	let rate = GetRefreshRate();
	if (oldChromeVersion) {
		console.log("Old alarm started.");
		if (alarmTimeoutId) {
			window.clearTimeout(alarmTimeoutId);
		}
		alarmTimeoutId = window.setTimeout(onAlarm, rate * 60 * 1000);
	} else {
		console.log("New alarm started.");
		chrome.alarms.create('UpdateIcon', {periodInMinutes: rate});		
	}
}

/**
 * Remove the ongoing alarm
 */
function RemoveAlarm() {
	if (oldChromeVersion) {
		if (alarmTimeoutId) {
			window.clearTimeout(alarmTimeoutId);
		}
	} else {
		chrome.alarms.clear('UpdateIcon');		
	}

}

/**
 * Reset FreeKiss' icon
 */
function ResetIcon() {
	chrome.browserAction.setBadgeText({text: ""});
}

/**
 * Callback when an alarm is triggered
 */
function onAlarm(alarm) {
	console.log("OnAlarm called.");
	FreeKiss.init(() => {
		ShowUnreadBookmarks();
		RefreshAlarm();
	}, true);
}

if (oldChromeVersion) {
	ApplyOptions();
} else {
	chrome.runtime.onInstalled.addListener(ApplyOptions);
	chrome.alarms.onAlarm.addListener(onAlarm);
}

/**
 * On startup, we check the options to update the icon and set the alarm if necessary
 */
if (chrome.runtime && chrome.runtime.onStartup) {
	chrome.runtime.onStartup.addListener(() => {
		ApplyOptions();
	});
} else {
	// This hack is needed because Chrome 22 does not persist browserAction icon
	// state, and also doesn't expose onStartup. So the icon always starts out in
	// wrong state. We don't actually use onStartup except as a clue that we're
	// in a version of Chrome that has this problem.
	chrome.windows.onCreated.addListener(() => {
		ApplyOptions();
	});
}