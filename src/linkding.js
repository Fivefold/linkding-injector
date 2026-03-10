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
    try {
      const response = await fetch(`${configuration.baseUrl}/api/bookmarks/?limit=1`, {
        headers: {
          Authorization: `Token ${configuration.token}`,
        },
      });

      if (response.status === 200) {
        const body = await response.json();
        return {
          success: !!body.results,
          status: response.status,
          message: 'Connection successful',
        };
      } else {
        let errorMessage = response.statusText || 'Unknown error';
        try {
          const body = await response.json();
          errorMessage = body.detail || body.message || errorMessage;
        } catch (e) {
          // Response wasn't JSON, use status text
        }

        return {
          success: false,
          status: response.status,
          message: errorMessage,
        };
      }
    } catch (error) {
      if(error.message == 'Failed to fetch' || error.message == 'NetworkError when attempting to fetch resource.'){
        // make error message clearer if the connection attempt itself fails
        error.message = 'Network error - unable to reach server';
      }
      return {
        success: false,
        status: null,
        message: error.message || 'Network error - unable to reach server',
      };
    }
  }
}
