"use strict";

function Popup() {
	$(document).ready(function() {

		if (FreeKiss.Options.get("disable") === true)
		{
			$("#disable").addClass("active").text("Enable FreeKiss");
		}

		if (FreeKiss.Options.get("maxDisable") === true)
		{
			$("#maxDisable").addClass("active").text("Enable max page resize");
		}

		if (FreeKiss.Options.get("minDisable") === true)
		{
			$("#minDisable").addClass("active").text("Enable min page resize");
		}

		$(".slider[name=maxPageWidth]").val(FreeKiss.Options.get("maxPageWidth")).next().text(FreeKiss.Options.get("maxPageWidth"));
		$(".slider[name=maxDoublePageWidth]").val(FreeKiss.Options.get("maxDoublePageWidth")).next().text(FreeKiss.Options.get("maxDoublePageWidth"));
		$(".slider[name=minPageWidth]").val(FreeKiss.Options.get("minPageWidth")).next().text(FreeKiss.Options.get("minPageWidth"));
		$(".slider[name=minDoublePageWidth]").val(FreeKiss.Options.get("minDoublePageWidth")).next().text(FreeKiss.Options.get("minDoublePageWidth"));
		
		$(".slider").on("input", function() {
			var name = $(this).attr("name");
			var value = $(this).val();
			$(this).next().text(value);
			FreeKiss.Options.set(name, value);
			FreeKiss.Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_PageResize === "function") FK_PageResize("' + name + '", ' + value + ', ' + FreeKiss.Options.get("maxDisable") + ', ' + FreeKiss.Options.get("minDisable") + ');'
					});
				}
			});
		});

		$("#maxDisable").click(function() {
			$(this).toggleClass("active");
			FreeKiss.Options.set("maxDisable", $(this).hasClass("active"));
			if (FreeKiss.Options.get("maxDisable")) {
				$(this).text("Enable max page resize");
			} else {
				$(this).text("Disable max page resize");
			}
			FreeKiss.Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_ToggleMaxWidth === "function") FK_ToggleMaxWidth(' + FreeKiss.Options.get("maxDisable") + ');'
					});
				}
			});
		});

		$("#minDisable").click(function() {
			$(this).toggleClass("active");
			FreeKiss.Options.set("minDisable", $(this).hasClass("active"));
			if (FreeKiss.Options.get("minDisable")) {
				$(this).text("Enable min page resize");
			} else {
				$(this).text("Disable min page resize");
			}
			FreeKiss.Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_ToggleMinWidth === "function") FK_ToggleMinWidth(' + FreeKiss.Options.get("minDisable") + ');'
					});
				}
			});
		});

		$("#disable").click(function() {
			$(this).toggleClass("active");
			FreeKiss.Options.set("disable", $(this).hasClass("active"));
			if (FreeKiss.Options.get("disable")) {
				$(this).text("Enable FreeKiss");
			} else {
				$(this).text("Disable FreeKiss");
			}
			FreeKiss.Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.reload(tabs[i].id);
				}
			});
		});

		$("#advancedOptions").click(function() {
			chrome.tabs.create({'url': chrome.extension.getURL('Views/Options.html')});
		});

	});
}

FreeKiss.init(Popup, false);