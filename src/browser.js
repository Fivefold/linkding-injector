function isChrome() {
  return typeof chrome !== "undefined";
}

export function getBrowser() {
  return isChrome() ? chrome : browser;
}

export async function getCurrentTabInfo() {
  const tabsPromise = isChrome() ? new Promise(resolve => getBrowser().tabs.query({
    active: true,
    currentWindow: true
  }, resolve)) : getBrowser().tabs.query({ active: true, currentWindow: true });

  const tabs = await tabsPromise;
  const tab = tabs && tabs[0];

  return {
    url: tab ? tab.url : "",
    title: tab ? tab.title : ""
  };
}

export function openOptions() {
  getBrowser().runtime.openOptionsPage();
  //window.close(); 
  /* 
  keeping window.close() introduces a bug in chrome if the options page is 
  opened and closed without saving options. The background script port closes
  seemingly indefinitely. The extension needs to be reloaded to fix it.

  Since linkding injector does not use the svelte popup from linkding extension
  window.close can be safely omitted because there's no window to close
  */
}