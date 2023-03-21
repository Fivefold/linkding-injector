**SearX/SearXNG support**

This extension includes experimental support for self-hosted SearX/SearXNG instances. To work, your instance must follow either of these URL patterns: `*://*/search?*`, `*://*/search`

Examples that work:
- `https://search.mywebsite.com/search`
- `https://search.mywebsite.com/search?q=searchTerm`
- `http://mysearch.local/search`

Examples that *don't* work:
- `https://search.mywebsite.com/`
- `http://mywebsite.com/searx/`
- `http://mywebsite.com/searx/search`

Also, nothing might be injected if you don't use the default "simple" theme.

If you have the correct URL, you see a linkding injector box in other supported search engines (e.g. google) but not in your SearX instance, please see if someone already [mentioned your issue](https://github.com/Fivefold/linkding-injector/issues) on github and if not, [create an issue](https://github.com/Fivefold/linkding-injector/issues/new/choose).