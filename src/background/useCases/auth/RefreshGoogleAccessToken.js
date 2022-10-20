importScripts(
  'src/background/useCases/storage/StorageAdd.js'
);

var RefreshGoogleAccessToken = function (googleConfig) {
  async function execute() {
    const storageAuthorizationInfo = await new StorageGet().execute({
      params: {
        key: 'authorizationInfo'
      }
    })

    const currentAuthorizationInfo = storageAuthorizationInfo.authorizationInfo;
    const refresh_token = currentAuthorizationInfo.refresh_token;

    const body = JSON.stringify({
      "grant_type": "refresh_token",
      "client_id": googleConfig.client_id,
      "client_secret": googleConfig.client_secret,
      "refresh_token": refresh_token
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

    const newAuthorizationInfo = {
      ...currentAuthorizationInfo,
      access_token: data.access_token,
    }
    saveAuthorizationInfo(newAuthorizationInfo);
    return newAuthorizationInfo;
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