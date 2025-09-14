//TODO: need a better global updating system for tabs so that I am not rerendering the whole list

async function getTabGroups() {
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

function addGroupListeners(group, title) {
  document.getElementById(title + "-group").addEventListener("click", () => {
    const tabGroup = document.getElementById(title);
    console.log(tabGroup);
    console.log(tabGroup.classList.contains("hide-group"));
    tabGroup.classList.toggle("hide-group");
  });

  addListeners(group);
}

function buildTabs(tabs) {
  const tabList = tabs
    .map((currentTab) => {
      const dropzoneId = currentTab.id + "dropzone";
      // console.log(currentTab);
      return `<li><div id=${dropzoneId}>Dropzone</div><div draggable="true" id=${currentTab.id} class="tab">
      <div class="tab-content">
                <img src=${
                  currentTab.favIconUrl
                } style="width:24px;height:24px;"/>
                <p>${currentTab.title}</p>
                </div>
                <div class="button-div">
                <button id=${currentTab.id + "close-button"} >X</button>
                </div>
            </div></li>`;
    })
    .join("");
  return tabList;
}

async function addListeners(tabs) {
  tabs.forEach(async (element) => {
    const currentElement = document.getElementById(element.id);
    const tabDropzone = document.getElementById(element.id + "dropzone");

    currentElement.addEventListener("click", async () => {
      const currentTab = await chrome.tabs.query({ active: true });
      const tabRemoveActiveState = document.getElementById(currentTab[0].id);
      tabRemoveActiveState.classList.remove("active-tab");
      document.getElementById(element.id).classList.add("active-tab");
      await chrome.tabs.update(element.id, { active: true });
    });

    currentElement.addEventListener("dragstart", () => {
      currentElement.classList.add("dragging");
      console.log("starting drag");
    });

    currentElement.addEventListener("dragend", () => {
      currentElement.classList.remove("dragging");
      console.log("ending drag");
    });

  
      tabDropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        tabDropzone.classList.add("over"); //switchto event.target
      });


          tabDropzone.addEventListener("dragenter", (e, element) => {
        e.preventDefault();
        console.log(element);
        tabDropzone.classList.add("over"); //switchto event.target
        console.log(e);
        console.log("entered dropzone");
      });

      tabDropzone.addEventListener("dragleave", (event) => {
        event.preventDefault();
        console.log("left dropzone");
        tabDropzone.classList.remove("over"); //switchto event.target
      });

    tabDropzone.addEventListener("drop", async (event) => {
      //TODO: Check if an element is in a tab group. If yes add source tab to tab group. Fix bug of tab groups duplicating
      event.preventDefault();
      console.log("dropped");
      const dropElementId = parseInt(event.target.id.replace("dropzone", ""));
      try {
        const elementToSwap = document.querySelector(".dragging");
      const sourceTab = await chrome.tabs.get(parseInt(elementToSwap.id));
      const targetTab = await chrome.tabs.get(parseInt(event.target.id.replace("dropzone", "")));
      console.log(sourceTab)
      console.log(targetTab);
      if (targetTab.groupId !== -1) {
        await chrome.tabs.group({tabIds: sourceTab.id, groupId: targetTab.groupId});
      } else if (targetTab.groupId === -1 && sourceTab.groupId !== -1) {
        await chrome.tabs.ungroup(sourceTab.id);
      }
      await chrome.tabs.move(sourceTab.id, {index: targetTab.index});
      // await chrome.tabs.move(dropElementId, {index: tabInformation.id});
      elementToSwap.classList.remove("dragging");
      tabDropzone.classList.remove("over");
      console.log("dropped");
      } catch (err) {
        console.log(err);
      }
    });

    document
      .getElementById(element.id + "close-button")
      .addEventListener("click", () => {
        chrome.tabs.remove(element.id, () => {
          console.log("tab removed");
        });
      });
    const currentTab = await chrome.tabs.query({ active: true });
    const tabRemoveActiveState = document.getElementById(currentTab[0].id);
    tabRemoveActiveState.classList.add("active-tab");
  });
}

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
  getTabGroups()
}

setTabs();

// chrome.tabs.onUpdated.addListener((tab) => {
//   console.log("noticed update");
//   console.log(tab);
//   grabTabs();
// });
chrome.tabs.onCreated.addListener(() => {
  grabTabs();
});
chrome.tabs.onRemoved.addListener(() => {
  grabTabs();
});
chrome.tabs.onMoved.addListener(() => {
  setTabs();
});
