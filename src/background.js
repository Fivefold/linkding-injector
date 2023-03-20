import { getBrowser, openOptions } from "./browser";
import { getConfiguration, isConfigurationComplete } from "./configuration";

import { LinkdingApi } from "./linkding";

const browser = getBrowser();

// Connection to search injection content script
let portFromCS;

function connected(p) {
  portFromCS = p;

  // When the content script sends the search term, search on linkding and
  // return results
  portFromCS.onMessage.addListener(async function (m) {
    if (m.action == "openOptions") {
      // Open the add on options if the user clicks on the options link in the
      // injected box
      openOptions();
    } else if ((await isConfigurationComplete()) == false) {
      portFromCS.postMessage({
        message:
          "Connection to your linkding instance is not configured yet! " +
          "Please configure the extension in the <a class='openOptions'>options</a>.",
      });
    } else {
      let config = await getConfiguration();

      const api = new LinkdingApi(config);

      // Configuration is complete, execute a search on linkding
      api
        .search(m.searchTerm, { limit: config.resultNum })
        .then((results) => {
          const bookmarkSuggestions = results.map((bookmark) => ({
            url: bookmark.url,
            title: bookmark.title || bookmark.website_title || bookmark.url,
            description: bookmark.description || bookmark.website_description,
            tags: bookmark.tag_names,
            date: bookmark.date_modified,
          }));
          portFromCS.postMessage({
            results: bookmarkSuggestions,
            config: config,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
}

browser.runtime.onConnect.addListener(connected);
