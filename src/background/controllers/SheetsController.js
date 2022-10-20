importScripts(
  'src/background/useCases/auth/RefreshGoogleAccessToken.js',
  'src/background/useCases/storage/StorageAdd.js'
);

var SheetsController = function () {
  async function saveSheetId(params) {
    const data = {
      sheets: {
        id: params.sheetId
      }
    }
    new StorageAdd().execute(data);
  }

  return {
    saveSheetId
  }
}();