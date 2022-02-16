window.AppBridge = window['app-bridge'];
window.Actions = AppBridge.actions;
window.Button = Actions.Button;
window.TitleBar = Actions.TitleBar;

document.addEventListener('DOMContentLoaded', async () => {
  var data = document.getElementById('shopify-app-init').dataset;

  window.app = AppBridge.default({
    apiKey: data.apiKey,
    host: data.host,
  });

  TitleBar.create(app, {
    title: data.page,
  });

  // Wait for a session token before trying to load an authenticated page
  await retrieveToken(app);

  // Keep retrieving a session token periodically
  keepRetrievingToken(app);

  // Redirect to the requested page when DOM loads
  var isInitialRedirect = true;
  redirectThroughTurbolinks(isInitialRedirect);

  document.addEventListener("turbolinks:load", function (event) {
    redirectThroughTurbolinks();
  });
});

const SESSION_TOKEN_REFRESH_INTERVAL = 2000;
async function retrieveToken(app) {
  window.sessionToken = await window['app-bridge-utils'].getSessionToken(app);
}

function keepRetrievingToken(app) {
  setInterval(() => {
    retrieveToken(app);
  }, SESSION_TOKEN_REFRESH_INTERVAL);
}

function redirectThroughTurbolinks(isInitialRedirect = false) {
  var data = document.getElementById("shopify-app-init").dataset;

  if (isInitialRedirect) {
    var shouldRedirect = data && data.loadPath;
  } else {
    var shouldRedirect = data && data.loadPath && data.loadPath !== '/rules';
  }

  if (shouldRedirect) {
    Turbolinks.visit(data.loadPath);
  }
}

document.addEventListener("turbolinks:request-start", function (event) {
  var xhr = event.data.xhr;
  xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
});

document.addEventListener("turbolinks:render", function () {
  $("form, a[data-method=delete]").on("ajax:beforeSend", function (event) {
    const xhr = event.detail[0];
    xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
  });
});