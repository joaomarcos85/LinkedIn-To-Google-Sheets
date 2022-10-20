var StorageAdd = function () {
  async function execute(data) {
    chrome.storage.sync.set(data, function () { });
  }

  return {
    execute
  }
};