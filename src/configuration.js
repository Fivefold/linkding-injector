const CONFIG_KEY = "ld_ext_config";

export function getConfiguration() {
  const configJson = localStorage.getItem(CONFIG_KEY);
  const config = configJson
    ? JSON.parse(configJson)
    : { baseUrl: "", token: "", resultNum: 10 };
  return config;
}

export function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  localStorage.setItem(CONFIG_KEY, configJson);
}

export function isConfigurationComplete() {
  const config = getConfiguration();

  return config.baseUrl && config.token;
}
