//TODO: need a better global updating system for tabs so that I am not rerendering the whole list
import { buildTabs, addListeners } from "./TabManager.js";
import { getTabGroups } from "./TabGroupManager.js";

export async function grabTabs() {
  //change to get all tab groups first
  // getTabGroups();
  const tabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });
  console.log(tabs);
  // get all tabs in tab groups
  //then get all tabs that aren't in a group
  const tabList = buildTabs(tabs);

  document.getElementById("tab-list").innerHTML = tabList;

  addListeners(tabs);
  // addListeners();
}

document.getElementById("add-tab-button").addEventListener("click", () => {
  chrome.tabs.create({ index: 0 });
});

async function getTabGroup(elementId) {
  const tabGroup = await chrome.tabGroups.get(elementId);
  console.log(tabGroup);
  return tabGroup.color;
}

function setTabs() {
  grabTabs();
  console.log("building tab groups");
  getTabGroups()
}

setTabs();

// chrome.tabs.onUpdated.addListener((tab) => {
//   console.log("noticed update");
//   console.log(tab);
//   grabTabs();
// });
chrome.tabs.onCreated.addListener((event) => {
  console.log(event)
  grabTabs();
});

chrome.tabs.onRemoved.addListener(() => {
  grabTabs();
});

chrome.tabs.onMoved.addListener((tabId, eventInfo) => {
  console.log(tabId);
  console.log(eventInfo);
  setTabs();
});

chrome.tabGroups.onUpdated.addEventListener(() => {
  console.log("group created");
})
