const tabs = await chrome.tabs.query({});
console.log(tabs);

const tabList = tabs.map(currentTab => {
    return `<li>${currentTab.title}</li>`;
}).join('');

console.log(tabList);
// tabList.forEach(element => {
//     document.querySelector("ul").append(element);
// });
document.getElementById("tabList").innerHTML = tabList;