import { isChrome, getBrowser } from "./browser";

const CONFIG_KEY = "ld_ext_config";

export async function getConfiguration() {
  const configPromise = isChrome()
    ? new Promise((resolve) => getBrowser().storage.local.get(CONFIG_KEY, resolve))
    : getBrowser().storage.local.get(CONFIG_KEY);
  const promiseResult = await configPromise;
  const configJson = promiseResult && promiseResult[CONFIG_KEY];
  const config = configJson
    ? JSON.parse(configJson)
    : {
        baseUrl: "",
        token: "",
        resultNum: 10,
        openLinkType: "newTab",
        themeGoogle: "auto",
        themeDuckduckgo: "auto",
      };
  return config;
}

export function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  getBrowser().storage.local.set({ [CONFIG_KEY]: configJson });
}

export async function isConfigurationComplete() {
  const config = await getConfiguration();

  return config.baseUrl && config.token;
}
