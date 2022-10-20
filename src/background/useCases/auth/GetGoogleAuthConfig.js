importScripts(
  'config.js'
);

var GetGoogleAuthConfig = function () {
  async function execute() {
    const googleConfig = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: "https://www.google.com.br",
    }
    return googleConfig;
  }

  return {
    execute
  }
}