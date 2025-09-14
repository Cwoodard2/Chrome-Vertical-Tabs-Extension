export function buildTabs(tabs) {
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