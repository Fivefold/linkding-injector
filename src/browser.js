export function isChrome() {
  return typeof chrome !== "undefined";
}

export function getBrowser() {
  return isChrome() ? chrome : browser;
}

export function getStorage() {
  if (
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined"
  ) {
    return browser.storage.local;
  } else if (
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined"
  ) {
    return chrome.storage.local;
  } else {
    throw new Error("Storage API not found.");
  }
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
