console.log("Background script running");

chrome.runtime.onInstalled.addListener(() => {
  // Reload LinkedIn tabs on install/update
  chrome.tabs.query({url: "*://*.linkedin.com/*"}, (tabs) => {
    for(let tab of tabs) {
      chrome.tabs.reload(tab.id);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL has changed
  if (changeInfo.status === "complete" && tab.url.includes("linkedin.com")) {
    sendMessageToTab(tabId);
  }
});

function sendMessageToTab(tabId) {
  chrome.tabs.sendMessage(tabId, { message: "check_page" }, (response) => {
    if (chrome.runtime.lastError) {
      setTimeout(() => sendMessageToTab(tabId), 1000); // retry after 1 second if failed
    } else if (!response.success) {
      setTimeout(() => sendMessageToTab(tabId), 1000); // retry after 1 second if not ready
    }
  });
}
