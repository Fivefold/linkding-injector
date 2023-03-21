![logo](/icons/logo_full.svg)

Community browser extension for the self-hosted [linkding](https://github.com/sissbruecker/linkding) bookmark service.

**Features**
- When searching on a search engine the search term is also sent to your linkding instance and results are added in a new box in the sidebar right to the search engine results.
- Supports the following search engines:
  - [google](https://www.google.com/)
  - [duckduckgo](https://duckduckgo.com/)
  - [SearX/SearXNG](https://duckduckgo.com/)*
  - [Brave Search](https://search.brave.com/)
- Automatic light or dark theme detection

Works with: Firefox, Chrome

_\* experimental, please read [this](docs/searx.md) if you have problems_

**Usage**

After installation the extension needs to be configured and connected to your linkding instance. Either open the extension options in the browser extension manager or follow the link in the new linkding injector box on the search page of google or duckduckgo.

Once the extension is properly configured linkding search results will show in the right sidebar. If there are no search results nothing will appear.

**Screenshots**

![duckduckgo](/docs/duckduckgo.png "Duckduckgo")
![google](/docs/google.png "google")

## Installation

Firefox: [Mozilla Addon Store](https://addons.mozilla.org/en-US/firefox/addon/linkding-injector/)

Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/linkding-injector/odjhldcomjlmfbdfeopdkeinpkmjibok)

## Manual installation

### Firefox

Run the build as described below and then follow the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) to load it into Firefox.

### Chrome

Run the build as described below and then follow the instructions [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest) to load it into Chrome.

## Build

**Requirements**
- Latest LTS Node version (v14+)
- Latest LTS NPM version (v6+)
- bash (on Linux) or powershell (on Windows)
- npx (included with npm v5.2+)

Internally, we use `web-ext` to bundle a distribution package for the extension for Firefox. You do not need to install `web-ext`. Note that `web-ext` will generate a zip file which can also be used for the Chrome Web Store.

Then run the following script to generate a build (might need to make the file executable on Linux using `chmod +x build.sh`):
```bash
./build.sh # Linux
```
```powershell
./build.ps1 # Windows
```

The script does:
- Install all dependencies using NPM
- Runs rollup to transpile and minify source files, with output written to the `build` directory
- Run web-ext to package the extension for uploading to the Mozilla addon store

After the build the root directory contains the complete, unpackaged extension. Use the `manifest.json` file to load it manually into the browser.

The packaged extension can be found in the `web-ext-artifacts` folder.

## Acknowledgements

This extension reuses and adapts code from the [official linkding extension](https://github.com/sissbruecker/linkding-extension).
