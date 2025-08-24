async function getTabGroups() {
  const tabGroups = await chrome.tabGroups.query({});
  console.log(tabGroups);
  let tabsInGroups = [];
  let finalGroups;
  tabGroups.forEach(async (element, index) => {
    const title = element.title.replaceAll(' ', '');
    const group = await chrome.tabs.query({ groupId: element.id });
    console.log(group);
    let groupName = title + "-group";
    console.log(groupName);
    finalGroups = `<li class="tab-group" id=${
      groupName
    }>${title}<ul id=${
      title
    } class="">${buildTabs(group)}</ul></li>`;

    document
      .getElementById("tab-group-list")
      .insertAdjacentHTML("beforeend", finalGroups);

    addGroupListeners(group, title);
  });
}

function addGroupListeners(group, element) {
  document
    .getElementById(element + "-group")
    .addEventListener("click", () => {
      const tabGroup = document.getElementById(element);
      console.log(tabGroup.classList.contains("hide-group"));
      tabGroup.classList.contains("hide-group") ? tabGroup.classList.remove("hide-group") : tabGroup.classList.add("hide-group");
    });

  addListeners(group);
}

function buildTabs(tabs) {
  const tabList = tabs
    .map((currentTab) => {
      return `<li draggable="true" style=${
        currentTab.active && "background-color:grey;"
      } id=${currentTab.id} class="tab">
      <div class="tab-content">
                <img src=${
                  currentTab.favIconUrl
                } style="width:24px;height:24px;"/>
                <p>${currentTab.title}</p>
                </div>
                <div>
                <button id=${currentTab.id + "close-button"} >X</button>
                </div> 
            </li>`;
    })
    .join("");
  return tabList;
}

async function addListeners(tabs) {
  tabs.forEach(async (element) => {
    const currentElement = document.getElementById(element.id);
    console.log(element.groupId);
    if (element.groupId != -1) {
      const groupColor = await getTabGroup(element.groupId);
      currentElement.classList.add(groupColor);
    }
    currentElement.addEventListener("click", () => {
      chrome.tabs.update(element.id, { active: true }, () => {
        console.log("Hey we updated!");
        grabTabs();
      });
    });

    currentElement.addEventListener("dragstart", () => {
      console.log("starting drag");
    });

    //add handling for if tab is first in list
    // document
    //   .getElementById(element.id + "up-button")
    //   .addEventListener("click", () => {
    //     chrome.tabs.move(element.id, { index: element.index - 1 });
    //   });

    // //Add handling for if tab is last in list
    // document
    //   .getElementById(element.id + "down-button")
    //   .addEventListener("click", () => {
    //     chrome.tabs.move(element.id, { index: element.index + 1 });
    //   });

    document
      .getElementById(element.id + "close-button")
      .addEventListener("click", () => {
        chrome.tabs.remove(element.id, () => {
          console.log("tab removed");
        });
      });
  });
}

export async function grabTabs() {
  //change to get all tab groups first
  getTabGroups();
  const tabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });
  console.log(tabs);
  // get all tabs in tab groups
  //then get all tabs that aren't in a group
  const tabList = buildTabs(tabs);

  document.getElementById("tab-list").insertAdjacentHTML("beforeend", tabList);

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

grabTabs();
getTabGroups();
// getTabGroup();

chrome.tabs.onUpdated.addListener((tab) => {
  console.log("noticed update");
  console.log(tab);
  grabTabs();
});
chrome.tabs.onCreated.addListener(grabTabs);
chrome.tabs.onRemoved.addListener(grabTabs);
chrome.tabs.onMoved.addListener(grabTabs);
