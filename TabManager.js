export async function grabTabs() {
  const tabs = await chrome.tabs.query({});
  console.log(tabs);

  const tabList = tabs
    .map((currentTab) => {
      console.log("active");
      return `<li style=${currentTab.active && "background-color:grey;"} id=${currentTab.id} class="tab">
                <p>${currentTab.title}</p> 
                <button id=${currentTab.id + "button"} >X</button>
            </li>`;
    })
    .join("");


  // console.log(tabList);

  document.getElementById("tabList").innerHTML = tabList;

  tabs.forEach(element => {
    document.getElementById(element.id).addEventListener("click", () => {
        chrome.tabs.update(element.id, {"active": true});
    })

    document.getElementById(element.id + "button").addEventListener("click", () => {
      chrome.tabs.remove(element.id, () => {
        console.log("tab removed");
      });
    })
  });
}

grabTabs();

chrome.tabs.onUpdated.addListener(() => {
  console.log("noticed update");
});
chrome.tabs.onRemoved.addListener(grabTabs);
chrome.tabs.onMoved.addListener(grabTabs);
