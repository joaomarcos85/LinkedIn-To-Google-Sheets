chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const routes = {
    "currentCandidateInfo": getCurrentCandidateInfo
  }

  if (!request.route) {
    console.log('sem rota');
    return;
  }
  const routeAction = routes[request.route];
  if (!routeAction) {
    console.log('sem action');
    return;
  }
  new Promise(async function () {
    const response = await getCurrentCandidateInfo();
    sendResponse(response);
  });
  return true;
});

async function getCurrentCandidateInfo() {
  const candidateInfo = await LinkedIn.getCurrentCandidateInfo();
  return candidateInfo;
}