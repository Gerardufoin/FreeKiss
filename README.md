# FreeKiss
FreeKiss is a simple Chrome extension aiming to improve the navigation and usage of [KissManga](http://kissmanga.com/).

If you are using Chrome, the extension can be downloaded on the [chrome store](https://chrome.google.com/webstore/detail/freekiss/jpndbkdfegaeebeehdmngbedkkchhflh).

> I mainly created this extension to fix some issues I had with KissManga. Now that it's done, I figured it could help others that were facing the same issues, so why not share it.

## Available features

The following is a list of FreeKiss' features and some explanations on how to use them.

**Note that all the features related to bookmarks are only available if you are logged in on KissManga.**

### Images resize
> Context: When reading on KissManga, you may sometimes stumble upon some images that are far larger than your screen or so small that you cannot read them. It's possible to zoom in/out every time to solve the issue, but it's annoying and I'm lazy.

This option allows you to set a minimum and maximum size (in pixels) for the chapters' images. If an image is bigger or smaller than the specified limitations, it will be resized accordingly.

Note that resizing an image has the same effect as zooming in/out on your browser, so expect an inevitable drop of quality.

![Resize example](/../Screenshots/Images/Screenshots/Resize_Example.png)
*The chapters' images will always be resized to fit between the red and the blue dotted lines in case they are smaller or bigger. If the image already fits, it will stay as is.*

### Enhanced bookmarks' display
> Context: I never remember a manga by its name. When looking at my bookmarks, I have no idea which manga is updated as long as I don't hover above its name to see the cover. Did I tell you I was lazy ?

FreeKiss changes the layout of the bookmarks page to include the mangas' image cover.

![Comparison between the default display and FreeKiss display](/../Screenshots/Images/Screenshots/Enhanced_Display.png)
*On the left is the default display of the bookmarks while the right side is the display while FreeKiss "Enhanced display" option is enabled.*

### Bookmarks manager
> Context: Didn't like being forced to go to the bookmarks page to manage my bookmarks. So now it's available at other places on the website.

The bookmarks managers allow you to manage your bookmarks (add/remove, change status *(see next section for status)*, mark as read/unread) on other pages than the bookmarks page.

The managers can be enabled on the frontpage, the mangas pages and the chapters pages.

![Example of the managers on the frontpage](/../Screenshots/Images/Screenshots/Manager_Example.png)

*Here is an example of the manager for some of the mangas on the frontpage.*

### Bookmarks status
> Context: As an ex-user of MangaFox, the feature that I missed the most on KissManga was the possibility to sort bookmarks with a status, such as "On Hold" or "Plan to read". So here you go.

FreeKiss adds a status option to your bookmarks. If you enable the option, a new status button will appear on the bookmark managers. Using this button, it is possible to assign a status to any bookmarks.

Once the option is enabled, the bookmarks will also be sorted on your bookmarks page.

![Sorted bookmarks page](/../Screenshots/Images/Screenshots/Sort_Status.png)
*It is possible to add the status without the enhanced display. Here is a screenshot of the two possible displays.*

The currently available status are "Default", "On Hold" and "Plan to read".

![Available status](/../Screenshots/Images/Screenshots/Status.png)

### Advanced options

Using the extension popup, it is possible to access the Advanced Options which allow you to enable or disable most of FreeKiss' features.

![Advanced Options](/../Screenshots/Images/Screenshots/Advanced_Options.png)

### Export bookmarks

While accessing the Advanced Options you will find a tab allowing you to export your bookmarks.

Three formats are currently available: plain text, XML and JSON.

![Advanced Options](/../Screenshots/Images/Screenshots/Export.png)

The current output is not really nice, so if you use this feature and have a suggestion do not hesitate to open an issue.

## Coding style

Before you grab some torches to come burn my house, I want to say that I am no javascript expert as it is not the language I am the most fluent with (don't really use it aside from writing this extension), so it is possible that part of the code is ugly. However, I am a pretty chill and open minded guy, so if you find something that you consider as an abomination that should normally be avoided at all cost, just send me a message and I'll look into it.
