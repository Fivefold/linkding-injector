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

const port = browser.runtime.connect({ name: "port-from-cs" });
let searchEngine;
if (document.location.hostname.match(/duckduckgo\.com/)) {
  searchEngine = "duckduckgo";
} else if (document.location.hostname.match(/google/)) {
  searchEngine = "google";
} else if (document.location.hostname.match(/search\.brave\.com/)) {
  searchEngine = "brave";
} else if (document.location.hostname.match(/kagi\.com/)) {
  searchEngine = "kagi";
} else if (document.location.href.match(/http.?:\/\/.+\/search/)) {
  searchEngine = "searx";
} else if (document.location.hostname.match(/qwant\.com/)) {
  searchEngine = "qwant";
} else {
  console.debug("Linkding-Injector extension: unknown search engine.");
}

/**
 * Selector for the container to inject into
 * @typedef {Object} InjectionContainerQuery
 * @property {function(): void | null} transformation - transformation to apply before using the selector
 * @property {string} selector - the CSS selector to use for querying the container
 * @property {function(): void | null} reverseTransformation - reversion of the transformation if the selector still wasn't found
 */

/**
 * CSS selectors for finding the sidebar to later inject into
 * @type { { [key: string]: Array.<InjectionContainerQuery> } }
 */
const sidebarSelectors = {
  duckduckgo: [
    { transformation: null, selector: "section[data-area=sidebar]", reverseTransformation: null },
    { transformation: null, selector: "section[data-area=mainline]", reverseTransformation: null }
  ],
  google: [
    { transformation: null, selector: "#rhs", reverseTransformation: null },
    {
      // Google completely omits the sidebar container if there is no content.
      // We need to add it manually before injection
      transformation: function() {
        const sidebarContainerString = `
        <div id="rhs" class="TQc1id hSOk2e rhstc4"></div>`;

        const parser = new DOMParser();
        const sidebarContainer = parser.parseFromString(
          sidebarContainerString,
          "text/html"
        );
        const container = document.querySelector("#rcnt");
        container?.appendChild(sidebarContainer.body.querySelector("div"));
      },
      selector: "#rhs",
      reverseTransformation: function() {
        const element = document.querySelector("#rhs");
        element?.parentElement.removeChild(element);
      }
    },
    { transformation: null, selector: "#topstuff", reverseTransformation: null }
  ],
  brave: [
    { transformation: null, selector: "aside.sidebar", reverseTransformation: null }
  ],
  searx: [
    { transformation: null, selector: "#sidebar", reverseTransformation: null }
  ],
  kagi: [
    { transformation: null, selector: ".right-content-box > ._0_right_sidebar", reverseTransformation: null }
  ],
  qwant: [
    { transformation: null, selector: ".is-sidebar", reverseTransformation: null }
  ],
};

// When background script answers with results, construct html for the result box
port.onMessage.addListener(function (m) {
  const parser = new DOMParser();
  let themeClass;
  let htmlString = "";
  let html;

  // In case we don't get results, but a message from the background script,
  // display it. This is the case before proper configuration
  if ("message" in m) {
    const showLogo = m.config?.showLogo ?? true; // If configuration is not done yet, m.config is undefined

    htmlString = `
    <div id="bookmark-list-container" class="${searchEngine}">
      <div id="navbar">
        <a id="ld-logo">
          ${showLogo ? `<img src="${browser.runtime.getURL("icons/logo.svg")}" class="setup" />` : ""}
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
    const themes = {
      duckduckgo: m.config.themeDuckduckgo,
      google: m.config.themeGoogle,
      brave: m.config.themeBrave,
      searx: m.config.themeSearx,
      kagi: m.config.themeKagi,
      qwant: m.config.themeQwant,
    };

    const theme = themes[searchEngine];

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
          ${m.config.showLogo ? `<img src="${browser.runtime.getURL("icons/logo.svg")}" />` : ""}
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

  // Finding the sidebar
  const sidebarSelector = sidebarSelectors[searchEngine] ?? [];
  let sidebar = null;

  for (const injectionContainerQuery of sidebarSelector) {
    if (injectionContainerQuery.transformation !== null) {
      injectionContainerQuery.transformation();
    }
    sidebar = document.querySelector(injectionContainerQuery.selector);

    if (sidebar !== null && sidebar.checkVisibility()) {
      break;
    }

    if(injectionContainerQuery.reverseTransformation !== null) {
      injectionContainerQuery.reverseTransformation();
    }
  }

  // Convert the html string into a DOM document
  html = parser.parseFromString(htmlString, "text/html");
  // The actual injection
  if (document.querySelector("#bookmark-list-container") == null) {
    sidebar.prepend(html.body.querySelector("div"));
  }

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
let searchTerm = escapeHTML(urlParams.get("q"));
if (searchEngine == "searx") {
  searchTerm = escapeHTML(document.querySelector("input#q").value);
}

if (searchEngine == "brave") {
  // Brave search seems to remove the injection box if it is injected too soon.
  // Wait a bit before injecting.
  setTimeout(function () {
    port.postMessage({ searchTerm: searchTerm });
  }, 1600);
} else if (searchEngine == "qwant") {
  // Qwant asynchronously loads the sidebar. We need to watch for when the
  // sidebar is loaded and only then start the injection
  const qwantObserver = new MutationObserver((mutations, observer) => {
    if (document.querySelector(sidebarSelectors["qwant"])) {
      port.postMessage({ searchTerm: searchTerm });
      observer.disconnect(); // Stop observing after the element appears
    }
  });

  qwantObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
} else {
  port.postMessage({ searchTerm: searchTerm });
}

