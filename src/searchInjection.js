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
} else if (document.location.hostname.match(/sear/)) {
  searchEngine = "searx";
}

// When background script answers with results, construct html for the result box
port.onMessage.addListener(function (m) {
  const parser = new DOMParser();
  let sidebar, html;
  // In case we don't get results, but a message from the background script, 
  // display it. This is the case before proper configuration
  if ("message" in m) {
    html = `
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
    html = parser.parseFromString(html, "text/html");
  } 
  // If there is no message and there are actual results display them
  else if (m.results.length > 0) {
    html = `
    <div id="bookmark-list-container" class="${searchEngine}">
      <div id="navbar">
        <a id="ld-logo">  
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

    html += `<ul id="bookmark-list">`;

    m.results.forEach((bookmark) => {
      html += `
        <li>
          <div class="title">
            <a
              href="${bookmark.url}"
              target=${m.openLinkType == "sameTab" ? "_self" : "_blank"}
              rel="noopener"
              >${escapeHTML(bookmark.title)}</a
            >
          </div>
          <div class="description">
            <span class="tags">
              ${bookmark.tags.map((tag) => {
                  return "<a>#" + escapeHTML(tag) + "</a>";
                }).join(" ")}
              </a>
            </span>
    
            ${bookmark.tags.length > 0 ? "|" : ""}
    
            <span>
              ${escapeHTML(bookmark.description)}
            </span>
          </div>
        </li>`;
    });
    html += `</ul></div>`;
    
    // Convert the above string into a DOM document
    html = parser.parseFromString(html, "text/html");
  } else {
    console.error("linkding injector: no message and no search results");
    return;
  }

  // querySelectors for finding the sidebar in the search engine websites
  if (searchEngine == "duckduckgo") {
    sidebar = document.querySelector(".sidebar-modules");
  } else if (searchEngine == "google") {
    sidebar = document.querySelector("#rhs");
  } else if (searchEngine == "searx") {
    sidebar = document.querySelector("#sidebar");
  }

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
if (searchEngine == "searx") {
  searchTerm = document.querySelector("#q").value
}

port.postMessage({ searchTerm: searchTerm });
