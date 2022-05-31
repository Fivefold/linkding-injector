function isChrome() {
  return typeof chrome !== "undefined";
}

function getBrowser() {
  return isChrome() ? chrome : browser;
}

/* Sanitise input to prevent unwanted injection of html or even javascript 
  through linkding search results, e.g. in the bookmark title or description 
*/
function escapeHTML(str) {
  let p = document.createElement("p");
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

const browser = getBrowser();

let port = browser.runtime.connect({ name: "port-from-cs" });
let searchEngine;
if (document.location.hostname.match(/duckduckgo/)) {
  searchEngine = "duckduckgo";
} else if (document.location.hostname.match(/google/)) {
  searchEngine = "google";
}

// When background script answers with results, construct html for the result box
port.onMessage.addListener(function (m) {
  const parser = new DOMParser();
  let theme, themeClass;
  let htmlString = "";
  let html;

  // In case we don't get results, but a message from the background script,
  // display it. This is the case before proper configuration
  if ("message" in m) {
    htmlString = `
    <div id="bookmark-list-container" class="${searchEngine}">
      <div id="navbar">
        <a id="ld-logo">  
          <img src=${browser.runtime.getURL("icons/logo.svg")} />
          <h1>linkding injector</h1>
        </a>
        <a id="ld-options" class="openOptions">
          <img class="ld-settings" src=${browser.runtime.getURL(
            "icons/cog.svg"
          )} />
        </a>
      </div>
      <div id="error-message">
        ${m.message}
      </div>
    </div>
    `;

    // Convert the above string into a DOM document
    html = parser.parseFromString(htmlString, "text/html");
  }
  // If there is no message and there are actual results display them
  else if (m.results.length > 0) {
    // If the theme for a search engine is not set to auto, we need to add
    // specific CSS classes
    // Get the theme configuration
    switch (searchEngine) {
      case "duckduckgo":
        theme = m.config.themeDuckduckgo;
        break;
      case "google":
        theme = m.config.themeGoogle;
        break;
    }
    if (theme == "auto") {
      themeClass = ""; // automatic theme detection
    } else {
      themeClass = theme; // "dark" for dark theme, "light" for light theme
    }

    // URL of the configured linkding instance (including search term)
    let linkdingUrl =
      m.config.baseUrl +
      (searchTerm.length > 0 ? `/bookmarks?q=${searchTerm}` : "/");

    htmlString += `
    <div id="bookmark-list-container" class="${searchEngine} ${themeClass}">
      <div id="navbar">
        <a id="ld-logo" href="${linkdingUrl}">  
          <img src=${browser.runtime.getURL("icons/logo.svg")} />
          <h1>linkding injector</h1>
        </a>
        <div id="results_amount">
          Found <span>${m.results.length}</span> ${
      m.results.length == 1 ? "result" : "results"
    }.
        </div>
        <a id="ld-options" class="openOptions">
          <img class="ld-settings" src=${browser.runtime.getURL(
            "icons/cog.svg"
          )} />
        </a>
      </div>
    `;

    htmlString += `<ul id="bookmark-list">`;

    m.results.forEach((bookmark) => {
      htmlString += `
        <li>
          <div class="title">
            <a
              href="${bookmark.url}"
              target=${m.config.openLinkType == "sameTab" ? "_self" : "_blank"}
              rel="noopener"
              >${escapeHTML(bookmark.title)}</a
            >
          </div>
          <div class="description ${themeClass}">
            <span class="tags">
              ${bookmark.tags
                .map((tag) => {
                  return "<a>#" + escapeHTML(tag) + "</a>";
                })
                .join(" ")}
              </a>
            </span>
    
            ${bookmark.tags.length > 0 ? "|" : ""}
    
            <span>
              ${escapeHTML(bookmark.description)}
            </span>
          </div>
        </li>`;
    });
    htmlString += `</ul></div>`;
  } else {
    console.error("linkding injector: no message and no search results");
    return;
  }

  let sidebar; // DOM document for the sidebar

  // querySelectors for finding the sidebar in the search engine websites
  if (searchEngine == "duckduckgo") {
    sidebar = document.querySelector(".sidebar-modules");
  } else if (searchEngine == "google") {
    sidebar = document.querySelector("#rhs");
    if (sidebar == null) {
      // google completely omits the sidebar container if there is no content.
      // we need to add it manually before injection
      let sidebarContainerString = `
        <div id="rhs" class="TQc1id hSOk2e rhstc4"></div>`;

      // construct DOM document from string
      let sidebarContainer = parser.parseFromString(
        sidebarContainerString,
        "text/html"
      );
      let container = document.querySelector("#rcnt"); // get main search result container
      container.appendChild(sidebarContainer.body.querySelector("div"));
      sidebar = document.querySelector("#rhs"); // get the added sidebar container
    }
  }

  // Convert the html string into a DOM document
  html = parser.parseFromString(htmlString, "text/html");
  // The actual injection
  sidebar.prepend(html.body.querySelector("div"));

  // Event listeners for opening the extension options. These can only be opened
  // by the background script, so we need to send a message to it
  document.querySelectorAll(".openOptions").forEach((el) => {
    el.addEventListener("click", () => {
      port.postMessage({ action: "openOptions" });
    });
  });
});

// Start the search by sending a message to background.js with the search term
let queryString = location.search;
let urlParams = new URLSearchParams(queryString);
let searchTerm = urlParams.get("q");

port.postMessage({ searchTerm: searchTerm });
