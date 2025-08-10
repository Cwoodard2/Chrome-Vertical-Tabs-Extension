export async function grabTabs() {
  const tabs = await chrome.tabs.query({});
  console.log(tabs);

  const tabList = tabs
    .map((currentTab) => {
      return `<li draggable="true" style=${currentTab.active && "background-color:grey;"} id=${currentTab.id} class="tab">
                <img src=${currentTab.favIconUrl} style="width:24px;height:24px;"/>
                <p>${currentTab.title}</p> 
                <button id=${currentTab.id + "up-button"}>up</button>
                <button id=${currentTab.id + "down-button"}>Down</button>
                <button id=${currentTab.id + "close-button"} >X</button>
            </li>`;
    })
    .join("");


  document.getElementById("tabList").innerHTML = tabList;

  tabs.forEach(element => {
    // getTabGroup(element.groupId);
    const currentElement = document.getElementById(element.id);
    currentElement.addEventListener("click", () => {
        chrome.tabs.update(element.id, {"active": true}, () => {
          console.log("Completed Update");
        });
    })

    //add handling for if tab is first in list
    document.getElementById(element.id + "up-button").addEventListener("click", () => {
        chrome.tabs.move(element.id, {"index": element.index-1});
    })
    
    //Add handling for if tab is last in list
    document.getElementById(element.id + "down-button").addEventListener("click", () => {
        chrome.tabs.move(element.id, {"index": element.index+1});
    })

    document.getElementById(element.id + "close-button").addEventListener("click", () => {
      chrome.tabs.remove(element.id, () => {
        console.log("tab removed");
      });
    })
  });
}

// function getTabGroup() {
//   chrome.tabGroups.query({});
//   console.log("group");
// }

grabTabs();
// getTabGroup();

// chrome.tabs.onUpdated.addListener((tab) => {
//   console.log("noticed update");
//   console.log(tab);
// });
chrome.tabs.onRemoved.addListener(grabTabs);
chrome.tabs.onMoved.addListener(grabTabs);
