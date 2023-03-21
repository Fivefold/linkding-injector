import { getStorage } from "./browser";

const CONFIG_KEY = "ld_ext_config";

export async function getConfiguration() {
  let config = "";

  const configJson = await getStorage().get(CONFIG_KEY);

  if (
    // if there is no saved configuration, save a default configuration
    configJson &&
    Object.keys(configJson).length === 0 &&
    Object.getPrototypeOf(configJson) === Object.prototype
  ) {
    config = {
      baseUrl: "",
      token: "",
      resultNum: 10,
      openLinkType: "newTab",
      themeGoogle: "auto",
      themeDuckduckgo: "auto",
      themeBrave: "auto",
      themeSearx: "auto",
    };
  } else {
    config = JSON.parse(configJson[CONFIG_KEY]);
  }
  return config;
}

export function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  getStorage().set({ [CONFIG_KEY]: configJson });
}

export async function isConfigurationComplete() {
  const config = await getConfiguration();

  if (config.baseUrl === "" || config.token === "") {
    return false;
  } else {
    return true;
  }
}
