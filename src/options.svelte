<script>
  import { getConfiguration, saveConfiguration } from "./configuration";
  import { LinkdingApi } from "./linkding";

  let baseUrl;
  let token;
  let resultNum;
  let openLinkType;
  let themeDuckduckgo;
  let themeGoogle;
  let themeBrave;
  let themeSearx;
  let themeKagi;
  let themeQwant;
  let themeStartpage;
  let isSuccess = false;
  let isError = false;
  let errorMessage = "";
  let errorStatus = null;

  async function init() {
    const config = await getConfiguration();
    baseUrl = config.baseUrl;
    token = config.token;
    resultNum = config.resultNum;
    openLinkType = config.openLinkType;
    themeDuckduckgo = config.themeDuckduckgo;
    themeGoogle = config.themeGoogle;
    themeBrave = config.themeBrave;
    themeSearx = config.themeSearx;
    themeKagi = config.themeKagi;
    themeQwant = config.themeQwant;
    themeStartpage = config.themeStartpage;
  }

  init();

  async function handleSubmit() {
    const config = {
      baseUrl,
      token,
      resultNum,
      openLinkType,
      themeDuckduckgo,
      themeGoogle,
      themeBrave,
      themeSearx,
      themeKagi,
      themeQwant,
      themeStartpage,
    };

    const testResult = await new LinkdingApi(config).testConnection(config);

    if (testResult.success) {
      await saveConfiguration(config);
      isError = false;
      isSuccess = true;
      errorMessage = "";
      errorStatus = null;
    } else {
      isSuccess = false;
      isError = true;
      errorMessage = testResult.message;
      errorStatus = testResult.status;
    }
  }
</script>

<h6>Configuration</h6>
<div class="divider" />
<p>
  This is a companion extension for the <a
    href="https://github.com/sissbruecker/linkding">linkding</a
  > bookmark service. Before you can start using it you have to configure some basic
  settings, so that the extension can communicate with your linkding installation.
</p>
<form class="form" on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <label class="form-label" for="input-base-url"
      >Base URL <span class="text-error">*</span></label
    >
    <input
      class="form-input"
      type="text"
      id="input-base-url"
      placeholder="https://linkding.mydomain.com"
      bind:value={baseUrl}
    />
    <div class="form-input-hint">
      The base URL of your linkding installation, <b>without</b> the
      <samp>/bookmark</samp> path or a trailing slash
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="input-token"
      >API Authentication Token <span class="text-error">*</span></label
    >
    <input
      class="form-input"
      type="password"
      id="input-token"
      placeholder="Token"
      bind:value={token}
    />
    <div class="form-input-hint">
      Used to authenticate against the linkding API. You can find this on your
      linkding settings page.
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="input-search-num"
      >Maximum number of search results
    </label>
    <input
      class="form-input"
      type="number"
      id="input-search-num"
      placeholder="10"
      bind:value={resultNum}
    />
    <div class="form-input-hint">
      The maximum number of search results. High numbers could lead to worse
      performance.
    </div>
  </div>
  <div class="accordion">
    <input type="checkbox" id="accordion-1" name="accordion-checkbox" hidden />
    <label class="accordion-header" for="accordion-1">
      <i class="icon-arrow-right mr-1 icon" />
      Advanced Settings
    </label>
    <div class="accordion-body">
      <div class="form-group">
        <div class="form-label">Default open link type</div>
        <label class="form-radio">
          <input
            type="radio"
            id="input-link-type"
            bind:group={openLinkType}
            value="newTab"
          />
          <i class="form-icon" />Open links in a new tab (default)
        </label>
        <label class="form-radio">
          <input
            type="radio"
            id="input-link-type"
            bind:group={openLinkType}
            value="sameTab"
          />
          <i class="form-icon" />Open links in the same tab
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="form-label">Theme of injection box</div>
        <div class="float-left form-label">google</div>
        <label class="form-inline float-right form-radio">
          <input
            type="radio"
            id="google-light"
            bind:group={themeGoogle}
            value="light"
          />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input
            type="radio"
            id="google-dark"
            bind:group={themeGoogle}
            value="dark"
          />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input
            type="radio"
            id="google-auto"
            bind:group={themeGoogle}
            value="auto"
          />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">DuckDuckGo</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeDuckduckgo} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeDuckduckgo} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeDuckduckgo} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">Brave Search†</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeBrave} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeBrave} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeBrave} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">SearX/SearXNG†</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeSearx} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeSearx} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeSearx} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">Kagi Search</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeKagi} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeKagi} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeKagi} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">Qwant</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeQwant} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeQwant} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeQwant} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="float-left form-label">Startpage</div>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeStartpage} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeStartpage} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-inline float-right form-radio">
          <input type="radio" bind:group={themeStartpage} value="auto" />
          <i class="form-icon" />auto (default)
        </label>
      </div>
      <div class="form-input-hint">
        † Automatic theme detection may fail with these search engines unless
        you set a specific theme (not 'system') in the search engine settings.
      </div>
    </div>
  </div>

  <div class="divider" />

  <div class="button-row">
    {#if isSuccess}
      <div class="form-group mr-2 has-success">
        <span class="form-input-hint">
          <i class="icon icon-check" /> Connection successful
        </span>
      </div>
    {:else if isError}
      <div class="form-group mr-2 has-error">
        <span class="form-input-hint">
          <div>
            <i class="icon icon-cross" /> Connection failed
          </div>
          <div>
            <b>Status Code:</b>
            {errorStatus} <br />
          </div>
          <div>
            <b>Error:</b>
            {errorMessage}
          </div>
        </span>
      </div>
    {:else}
      <div></div>
    {/if}
    <button
      type="submit"
      class="ml-2 btn btn-primary"
      disabled={!(baseUrl && token)}
    >
      Save
    </button>
  </div>
</form>

<style>
  .button-row {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    justify-content: space-between;
  }
  .button-row button {
    padding-left: 32px;
    padding-right: 32px;
  }
</style>
