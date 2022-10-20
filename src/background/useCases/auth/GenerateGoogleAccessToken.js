importScripts(
  'src/background/useCases/storage/StorageAdd.js'
);

var GenerateGoogleAccessToken = function (googleConfig) {
  async function execute(authorization_code) {
    const body = JSON.stringify({
      "grant_type": "authorization_code",
      "code": authorization_code,
      "client_id": googleConfig.client_id,
      "client_secret": googleConfig.client_secret,
      "redirect_uri": googleConfig.redirect_uri
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: body,
      redirect: 'follow'
    };

    const response = await fetch("https://oauth2.googleapis.com/token", requestOptions);
    const data = await response.json();
    const authorizationInfo = {
      authorization_code: authorization_code,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    }
    saveAuthorizationInfo(authorizationInfo);
  }

  function saveAuthorizationInfo(authorizationInfo) {
    const data = {
      authorizationInfo: authorizationInfo
    }
    new StorageAdd().execute(data);
  }

  return {
    execute
  }
}