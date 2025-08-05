chrome.commands.onCommand.addListener((command) => {
    if (command === "open-panel") {
        chrome.windows.getCurrent((currentWindow) => {
            chrome.sidePanel.open({"windowId": currentWindow.id});
        })
    }
})