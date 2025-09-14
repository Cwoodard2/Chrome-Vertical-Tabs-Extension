import { buildTabs, addListeners } from "./TabManager.js";
export async function getTabGroups() {
  //TODO: Create a dedicated function to building the tab groups
  document.getElementById("tab-group-list").innerHTML = "";
  const tabGroups = await chrome.tabGroups.query({});
  console.log(tabGroups);
  let tabsInGroups = [];
  let finalGroups;
  tabGroups.forEach(async (element, index) => {
    const title = element.title.replaceAll(" ", "");
    const group = await chrome.tabs.query({ groupId: element.id });
    let groupName = title + "-group";
    finalGroups = `<li class="tab-group"><button id=${groupName}>${title}</button><ul id=${title} class="">${buildTabs(
      group
    )}</ul></li>`;

    document
      .getElementById("tab-group-list")
      .insertAdjacentHTML("beforeend", finalGroups);

    document.getElementById(groupName).classList.add(element.color);

    addGroupListeners(group, title);
  });
}

export function addGroupListeners(group, title) {
  document.getElementById(title + "-group").addEventListener("click", () => {
    const tabGroup = document.getElementById(title);
    console.log(tabGroup);
    console.log(tabGroup.classList.contains("hide-group"));
    tabGroup.classList.toggle("hide-group");
  });

  addListeners(group);
}