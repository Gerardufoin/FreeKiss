"use strict";

function Popup() {
	$(document).ready(function() {

		if (Options.get("disable") === true)
		{
			$("#disable").addClass("active").text("Enable FreeKiss");
		}

		if (Options.get("maxDisable") === true)
		{
			$("#maxDisable").addClass("active").text("Enable max page resize");
		}

		if (Options.get("minDisable") === true)
		{
			$("#minDisable").addClass("active").text("Enable min page resize");
		}

		$(".slider[name=maxPageWidth]").val(Options.get("maxPageWidth")).next().text(Options.get("maxPageWidth"));
		$(".slider[name=maxDoublePageWidth]").val(Options.get("maxDoublePageWidth")).next().text(Options.get("maxDoublePageWidth"));
		$(".slider[name=minPageWidth]").val(Options.get("minPageWidth")).next().text(Options.get("minPageWidth"));
		$(".slider[name=minDoublePageWidth]").val(Options.get("minDoublePageWidth")).next().text(Options.get("minDoublePageWidth"));
		
		$(".slider").on("input", function() {
			var name = $(this).attr("name");
			var value = $(this).val();
			$(this).next().text(value);
			Options.set(name, value);
			Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_PageResize === "function") FK_PageResize("' + name + '", ' + value + ', ' + Options.get("maxDisable") + ', ' + Options.get("minDisable") + ');'
					});
				}
			});
		});

		$("#maxDisable").click(function() {
			$(this).toggleClass("active");
			Options.set("maxDisable", $(this).hasClass("active"));
			if (Options.get("maxDisable")) {
				$(this).text("Enable max page resize");
			} else {
				$(this).text("Disable max page resize");
			}
			Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_ToggleMaxWidth === "function") FK_ToggleMaxWidth(' + Options.get("maxDisable") + ');'
					});
				}
			});
		});

		$("#minDisable").click(function() {
			$(this).toggleClass("active");
			Options.set("minDisable", $(this).hasClass("active"));
			if (Options.get("minDisable")) {
				$(this).text("Enable min page resize");
			} else {
				$(this).text("Disable min page resize");
			}
			Options.save();
			chrome.tabs.query({url: "*://kissmanga.com/Manga/*/*"}, function(tabs) {
				for (var i = 0; i < tabs.length; ++i) {
					chrome.tabs.executeScript(tabs[i].id, {
						code: 'if (typeof FK_ToggleMinWidth === "function") FK_ToggleMinWidth(' + Options.get("minDisable") + ');'
					});
				}
			});
		});

		$("#disable").click(function() {
			$(this).toggleClass("active");
			Options.set("disable", $(this).hasClass("active"));
			if (Options.get("disable")) {
				$(this).text("Enable FreeKiss");
			} else {
				$(this).text("Disable FreeKiss");
			}
			Options.save();
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

Options.init(Popup, false);