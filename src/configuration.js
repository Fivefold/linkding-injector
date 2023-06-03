import { getStorage } from "./browser";

const CONFIG_KEY = "ld_ext_config";

export const getConfiguration = async () => {
  return new Promise((resolve) => {
    getStorage().get(CONFIG_KEY, (data) => {
      const config = JSON.parse(
        data[CONFIG_KEY] || {
          baseUrl: '',
          token: '',
          resultNum: 10,
          openLinkType: 'newTab',
          themeGoogle: 'auto',
          themeDuckduckgo: 'auto',
          themeBrave: 'auto',
          themeSearx: 'auto',
        }
      )
      resolve(config)
    })
  })
}

export function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  getStorage().set({ [CONFIG_KEY]: configJson });
}

export const isConfigurationComplete = async () => {
  const { baseUrl, token } = await getConfiguration()
  return !!baseUrl && !!token
}