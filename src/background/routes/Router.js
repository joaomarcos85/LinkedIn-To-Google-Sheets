importScripts(
  'src/background/useCases/storage/StorageGet.js',
  'src/background/controllers/SheetsController.js',
  'src/background/controllers/LinkedInController.js',
  'src/background/controllers/DriveController.js'
)

var Router = function () {
  return {
    'sheets/saveSheetId': SheetsController.saveSheetId,
    'linkedIn/saveLinkedInData': LinkedInController.saveLinkedInData,
    'drive/saveFolderId': DriveController.saveFolderId,
  };
};