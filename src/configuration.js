import { getStorage } from "./browser";

const CONFIG_KEY = "ld_ext_config";

const DEFAULT_CONFIG = {
  baseUrl: "",
  token: "",
  resultNum: 10,
  openLinkType: "newTab",
  themeGoogle: "auto",
  themeDuckduckgo: "auto",
  themeBrave: "auto",
  themeSearx: "auto",
};

export async function getConfiguration() {
  return new Promise((resolve) => {
    getStorage().get(CONFIG_KEY, (data) => {
      const config = JSON.parse(data[CONFIG_KEY] || DEFAULT_CONFIG);
      resolve(config);
    });
  });
};

export function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  getStorage().set({ [CONFIG_KEY]: configJson });
}

export async function isConfigurationComplete() {
  const { baseUrl, token } = await getConfiguration();
  return !!baseUrl && !!token;
};
