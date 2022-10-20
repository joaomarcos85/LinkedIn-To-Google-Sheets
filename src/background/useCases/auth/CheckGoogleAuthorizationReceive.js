importScripts(
  'src/background/useCases/auth/GetGoogleAuthConfig.js',
  'src/background/useCases/auth/GenerateGoogleAccessToken.js'
);

var CheckGoogleAuthorizationReceive = function () {
  async function execute(url) {
    const authorization_code = new URLSearchParams(url.search).get('code');

    const googleConfig = await getGoogleConfig();

    if (!authorization_code || !String(url.origin).startsWith(googleConfig.redirect_uri)) {
      return;
    };

    await new GenerateGoogleAccessToken(googleConfig).execute(authorization_code);
  }

  async function getGoogleConfig() {
    const googleConfig = await new GetGoogleAuthConfig().execute();
    return googleConfig;
  }

  return {
    execute
  }
}