export class LinkdingApi {
  constructor(configuration) {
    this.configuration = configuration;
  }

  async search(text, options) {
    const configuration = this.configuration;
    const q = encodeURIComponent(text);
    const limit = options.limit || 100;

    return fetch(
      `${configuration.baseUrl}/api/bookmarks/?q=${q}&limit=${limit}`,
      {
        headers: {
          Authorization: `Token ${configuration.token}`,
        },
      }
    ).then((response) => {
      if (response.status === 200) {
        return response.json().then((body) => body.results);
      }
      return Promise.reject(
        `Error searching bookmarks: ${response.statusText}`
      );
    });
  }

  async testConnection() {
    const configuration = this.configuration;
    return fetch(`${configuration.baseUrl}/api/bookmarks/?limit=1`, {
      headers: {
        Authorization: `Token ${configuration.token}`,
      },
    })
      .then((response) =>
        response.status === 200 ? response.json() : Promise.reject(response)
      )
      .then((body) => !!body.results)
      .catch(() => false);
  }
}
