var StorageGet = function () {
  async function execute(params) {
    return new Promise(function (resolve) {
      chrome.storage.sync.get(params.key, function (items) {
        resolve(items);
      });
    });
  }

  return {
    execute
  }
};