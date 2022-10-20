importScripts(
  'src/background/useCases/auth/GetGoogleAuthConfig.js',
  'src/background/useCases/storage/StorageGet.js',
  'src/background/useCases/auth/RequestGoogleAuthorization.js'
);

var GetGoogleSheetsConfig = function () {
  async function execute() {
    const storageAuthorizationInfo = await new StorageGet().execute({
      params: {
        key: 'authorizationInfo'
      }
    })

    const authorizationInfo = storageAuthorizationInfo.authorizationInfo;

    if (!authorizationInfo || !authorizationInfo.access_token) {
      const googleConfig = await new GetGoogleAuthConfig().execute();
      await new RequestGoogleAuthorization(googleConfig).execute();
    }
    const access_token = authorizationInfo.access_token;
    const sheetsConfig = {
      access_token: access_token
    }
    return sheetsConfig;
  }

  return {
    execute
  }
}();