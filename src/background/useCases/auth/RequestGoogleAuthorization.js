var RequestGoogleAuthorization = function (googleConfig) {
  async function execute() {
    const redirect_uri = encodeURIComponent(googleConfig.redirect_uri);
    const prompt = 'consent';
    const response_type = 'code';
    const client_id = googleConfig.client_id;
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ];
    const access_type = 'offline';
    const flowName = 'GeneralOAuthFlow';
    const options = [
      `redirect_uri=${redirect_uri}`,
      `prompt=${prompt}`,
      `response_type=${response_type}`,
      `client_id=${client_id}`,
      `scope=${scopes.join(' ')}`,
      `access_type=${access_type}`,
      `flowName=${flowName}`
    ]
    chrome.tabs.update({
      url: 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?' + options.join('&')
    });
  }

  return {
    execute
  }
}