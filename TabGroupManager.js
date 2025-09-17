import { buildTabs, addListeners } from "./TabManager.js";
export async function getTabGroups() {
  //TODO: Create a dedicated function to building the tab groups
  const tabGroups = await chrome.tabGroups.query({});
  tabGroups.forEach((tabGroup) => buildTabGroup(tabGroup));
}

async function buildTabGroup(tabGroup) {
    const tabGroupTabs = await getTabGroup(tabGroup);
    let tabGroupName = tabGroup.title.replaceAll(" ", "-") + "-toggle";
    const builtTabGroup = `<li class="tab-group"><button id=${tabGroupName}>${tabGroup.title}</button><ul id=${tabGroup.id} class="">${buildTabs(
      tabGroupTabs
    )}</ul></li>`;

    document
      .getElementById("tab-group-list")
      .insertAdjacentHTML("beforeend", builtTabGroup);

    document.getElementById(tabGroupName).classList.add(tabGroup.color);

    addGroupListeners(tabGroupTabs, tabGroupName, tabGroup.id);
}

async function getTabGroup(group) {
  const tabGroup = await chrome.tabs.query({ groupId: group.id });
  return tabGroup;
}

export function addGroupListeners(tabGroupTabs, tabGroupName, tabGroupId) {
  document.getElementById(tabGroupName).addEventListener("click", () => {
    const tabGroup = document.getElementById(tabGroupId);
    tabGroup.classList.toggle("hide-group");
  });

  addListeners(tabGroupTabs);
}
