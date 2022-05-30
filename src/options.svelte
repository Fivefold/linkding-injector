<script>
  import { getConfiguration, saveConfiguration } from "./configuration";
  import { testConnection } from "./linkding";

  let baseUrl = "";
  let token = "";
  let resultNum = 10;
  let openLinkType = "newTab";
  let theme = {
    duckduckgo: "auto",
    google: "auto",
  };
  let isSuccess = false;
  let isError = false;

  function init() {
    const config = getConfiguration();
    baseUrl = config.baseUrl;
    token = config.token;
    resultNum = config.resultNum;
    openLinkType = config.openLinkType;
    theme = config.theme;
  }

  init();

  async function handleSubmit() {
    const config = {
      baseUrl,
      token,
      resultNum,
      openLinkType,
      theme,
    };

    const testResult = await testConnection(config);

    if (testResult) {
      saveConfiguration(config);
      isError = false;
      isSuccess = true;
    } else {
      isSuccess = false;
      isError = true;
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
    <label class="form-label" for="input-base-url">Base URL</label>
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
    <label class="form-label" for="input-token">API Authentication Token</label>
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
  <div class="form-group">
    <label class="form-label" for="input-link-type"
      >Default open link type
    </label>
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

  <div class="divider" />

  <div class="button-row">
    {#if isSuccess}
      <div class="form-group has-success mr-2">
        <span class="form-input-hint"
          ><i class="icon icon-check" /> Connection successful
        </span>
      </div>
    {/if}
    {#if isError}
      <div class="form-group has-error mr-2">
        <span class="form-input-hint">
          <i class="icon icon-cross" /> Connection failed
        </span>
      </div>
    {/if}
    <button
      type="submit"
      class="btn btn-primary ml-2"
      disabled={!(baseUrl && token)}
    >
      Save
    </button>
  </div>
</form>

<style>
  .button-row {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
  }
  .button-row button {
    padding-left: 32px;
    padding-right: 32px;
  }
</style>
