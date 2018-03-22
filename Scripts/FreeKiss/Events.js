"use strict";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ? "From a content script:" + sender.tab.url : "From the extension");
	if (request.greeting == "hello") {
		sendResponse({farewell: "goodbye"});
	}
});
