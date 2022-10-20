importScripts(
  'src/background/useCases/auth/RefreshGoogleAccessToken.js',
  'src/background/useCases/storage/StorageAdd.js'
);

var DriveController = function () {
  async function saveFolderId(params) {
    const data = {
      drive: {
        folder: {
          id: params.folderId
        }
      }
    }
    new StorageAdd().execute(data);
  }

  return {
    saveFolderId
  }
}();