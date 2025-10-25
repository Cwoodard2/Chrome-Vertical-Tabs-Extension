export function buildTabs(tabs) {
  const tabList = tabs
    .map((currentTab) => {
      const dropzoneId = currentTab.id + "dropzone";
      // console.log(currentTab);
      return `<li><div id=${dropzoneId}>Dropzone</div><div draggable="true" id=${
        currentTab.id
      } class="tab">
      <div class="tab-content">
                <img src=${
                  currentTab.favIconUrl
                } style="width:20px;height:20px;"/>
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

//TODO: use tab opener ID to determine where to place a tab if it is opened by another tab
export function buildTab(tabData) {
  console.log(tabData);
  const dropzoneId = tabData.id + "dropzone";
  const newTab = `<li><div id=${dropzoneId}>Dropzone</div><div draggable="true" id=${
    tabData.id
  } class="tab">
      <div class="tab-content">
                <img src=${
                  tabData.favIconUrl
                } style="width:20px;height:20px;"/>
                <p>${tabData.title}</p>
                </div>
                <div class="button-div">
                <button id=${tabData.id + "close-button"} >X</button>
                </div>
            </div></li>`;

  if (tabData.groupId !== -1) {
    const tabGroup = document.getElementById(tabData.groupId);

  } 
  console.log(newTab);
  document.getElementById("tab-list").insertAdjacentHTML("beforeend", newTab);
  //TODO: Add event listeners

}

export function moveTab(sourceElement, targetElement) {
  //TODO: remove tab from dom then move it adjacent to the tab that we want it at; Fix slowdowns that show up when moving tabs
  //TODO: Add support for tab groups; JK it works automatically; Fix bug that causes elements to disappear
  //TODO: Fix issue where tabs are not put in the correct spot in the DOM when put to the front of the list when not in a tab group
  sourceElement.parentNode.remove();
  targetElement.insertAdjacentElement("beforebegin", sourceElement.parentNode);
}

export async function addListeners(tabs) {
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
      tabDropzone.classList.add("over"); //switch to event.target
    });

    tabDropzone.addEventListener("dragenter", (e, element) => {
      e.preventDefault();
      console.log(element);
      tabDropzone.classList.add("over"); //switch to event.target
      console.log(e);
      console.log("entered dropzone");
    });

    tabDropzone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      console.log("left dropzone");
      tabDropzone.classList.remove("over"); //switch to event.target
    });

    tabDropzone.addEventListener("drop", async (event) => {
      //TODO: Check if an element is in a tab group. If no add source tab to tab group. Fix bug of tab groups duplicating
      event.preventDefault();
      console.log("dropped");
      const dropElementId = parseInt(event.target.id.replace("dropzone", ""));
      try {
        const elementToSwap = document.querySelector(".dragging");
        const targetElement = document.getElementById(event.target.id);
        const sourceTab = await chrome.tabs.get(parseInt(elementToSwap.id));
        const targetTab = await chrome.tabs.get(
          parseInt(event.target.id.replace("dropzone", ""))
        );
        if (targetTab.groupId !== -1) {
          await chrome.tabs.group({
            tabIds: sourceTab.id,
            groupId: targetTab.groupId,
          });
        } else if (targetTab.groupId === -1 && sourceTab.groupId !== -1) {
          await chrome.tabs.ungroup(sourceTab.id);
        }
        await chrome.tabs.move(sourceTab.id, { index: targetTab.index });
        elementToSwap.classList.remove("dragging");
        tabDropzone.classList.remove("over");
        console.log("dropped");
        moveTab(elementToSwap, targetElement);
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
