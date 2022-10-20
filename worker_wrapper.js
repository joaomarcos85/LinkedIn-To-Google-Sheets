importScripts(
  'src/background/routes/Router.js',
  'src/background/useCases/auth/CheckGoogleAuthorizationReceive.js'
);
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status != 'complete') return;

  const url = new URL(tab.url);
  new CheckGoogleAuthorizationReceive().execute(url);
})

const router = new Router();
chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {
  const route = message.route;
  const params = message.params;
  const useCase = router[route];

  if (useCase.execute) {
    useCase.execute(params).then(senderResponse);
  } else {
    useCase(params).then(senderResponse);
  }
  return true;
});