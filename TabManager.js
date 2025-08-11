export async function grabTabs() {
  const tabs = await chrome.tabs.query({});
  console.log(tabs);

  const tabList = tabs
    .map((currentTab) => {
      return `<li draggable="true" style=${
        currentTab.active && "background-color:grey;"
      } id=${currentTab.id} class="tab">
      <div class="tab">
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

  // <button id=${currentTab.id + "up-button"}>up</button>
  //             <button id=${currentTab.id + "down-button"}>Down</button>

  document.getElementById("tabList").innerHTML = tabList;

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

document.getElementById("add-tab-button").addEventListener("click", () => {
  chrome.tabs.create({});
})

async function getTabGroup(elementId) {
  const tabGroup = await chrome.tabGroups.get(elementId);
  console.log(tabGroup);
  return tabGroup.color;
}

grabTabs();
// getTabGroup();

chrome.tabs.onUpdated.addListener((tab) => {
  console.log("noticed update");
  console.log(tab);
  grabTabs();
});
chrome.tabs.onCreated.addListener(grabTabs);
chrome.tabs.onRemoved.addListener(grabTabs);
chrome.tabs.onMoved.addListener(grabTabs);
