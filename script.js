async function getSheetId(url) {
  const currentUrl = String(url);
  if (!currentUrl.startsWith('https://docs.google.com/spreadsheets')) {
    return;
  }
  const sheetId = currentUrl.match(/(?<=https:\/\/docs.google.com\/spreadsheets\/d\/)(.+)(?=\/edit?)/g);
  if (!sheetId || !Array.isArray(sheetId) || sheetId.length == 0) {
    return "";
  }
  return sheetId[0];
}

async function getFolderId(url) {
  const currentUrl = String(url);
  if (!currentUrl.startsWith('https://drive.google.com/drive/folders/')) {
    return;
  }
  const folderId = currentUrl.match(/(?<=https:\/\/drive.google.com\/drive\/folders\/)(.+)(?=\/?)/g);
  if (!folderId || !Array.isArray(folderId) || folderId.length == 0) {
    return "";
  }
  return folderId[0];
}

async function getCurrentTabUrl() {
  return await new Promise(function (resolve) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs[0].url);
    })
  });
}
document.addEventListener('DOMContentLoaded', async function () {
  const currentUrl = await getCurrentTabUrl();
  checkSheetPage(currentUrl);
  checkDrivePage(currentUrl);
  checkLinkedInPage(currentUrl);
});

async function checkSheetPage(url) {
  const sheetId = await getSheetId(url);
  if (!sheetId) return;
  document.querySelector('#btn-select-sheet').disabled = false;
}

async function checkDrivePage(url) {
  const folderId = await getFolderId(url);
  if (!folderId) return;
  document.querySelector('#btn-select-folder').disabled = false;
  Steps.setCurrentFieldset(1, 0)
}

async function checkLinkedInPage(url) {
  if (!url.startsWith('https://www.linkedin.com/hiring/jobs/')) {
    return;
  }
  document.querySelector('#btn-start-save').disabled = false;
  Steps.setCurrentFieldset(2, 0)
}

document.querySelector('#btn-select-sheet').addEventListener('click', async function () {
  const currentUrl = await getCurrentTabUrl();
  const sheetId = await getSheetId(currentUrl);
  await saveSheetId(sheetId);
})

document.querySelector('#btn-select-folder').addEventListener('click', async function () {
  const currentUrl = await getCurrentTabUrl();
  const folderId = await getFolderId(currentUrl);
  if (!folderId) {
    alert('Error folderId!');
  }
  await saveFolderId(folderId);
})

document.querySelector('#btn-start-save').addEventListener('click', async function () {
  saveLinkedInData()
})

async function saveSheetId(sheetId) {
  const request = {
    route: 'sheets/saveSheetId',
    params: {
      sheetId: sheetId
    }
  }
  chrome.runtime.sendMessage(request, (data) => {

  });
}

async function saveFolderId(folderId) {
  const request = {
    route: 'drive/saveFolderId',
    params: {
      folderId: folderId
    }
  }
  chrome.runtime.sendMessage(request, (data) => {

  });
}

async function saveLinkedInData() {
  toastr.info('Salvando...');
  const request = {
    route: 'linkedIn/saveLinkedInData',
    params: {}
  }
  chrome.runtime.sendMessage(request, (data) => {
    if (data.status && data.status == 'SUCCESS') {
      const name = data.data.name;
      toastr.success(`${name} adicionado a planilha!`, 'Concluído!');
    } else {
      console.log('data', data);
      toastr.error('Erro');
    }
  });
}


const Steps = function () {

  let currentFieldset = 0;
  let animating;
  let current_fs, next_fs, previous_fs;

  function getCurrentFieldset() {
    return currentFieldset;
  }

  async function setCurrentFieldset(target, animationDuration = 500) {
    if (target > Steps.getCurrentFieldset()) {
      for (let i = Steps.getCurrentFieldset() + 1; i <= target; i++) {
        await Steps.next(animationDuration);
      }
    } else {
      for (let i = Steps.getCurrentFieldset(); i > target; i--) {
        await Steps.previous(animationDuration);
      }
    }
  }

  function previous(duration = 500) {
    return new Promise(function (resolve) {
      if (animating) return false;
      animating = true;

      current_fs = $(`fieldset[data-fieldset="${getCurrentFieldset()}"]`);
      previous_fs = $(current_fs).prev();
      const fieldset = current_fs.data('fieldset');
      $("#progressbar li").eq(fieldset).removeClass("active");
      currentFieldset--;
      previous_fs.show();
      let left, opacity, scale;
      current_fs.animate(
        { opacity: 0 },
        {
          step: function (now, mx) {
            scale = 0.8 + (1 - now) * 0.2;
            left = (1 - now) * 50 + "%";
            opacity = 1 - now;
            current_fs.css({ left: left });
            previous_fs.css({
              transform: "scale(" + scale + ")",
              opacity: opacity
            });
          },
          duration,
          complete: function () {
            current_fs.hide();
            animating = false;
            resolve();
          },
          easing: "easeInOutBack"
        }
      );
    });
  }

  function next(duration = 500) {
    return new Promise(function (resolve) {
      if (animating) return false;
      animating = true;
      current_fs = $(`fieldset[data-fieldset="${getCurrentFieldset()}"]`);
      next_fs = $(current_fs).next();
      const fieldset = next_fs.data('fieldset');
      $("#progressbar li").eq(fieldset).addClass("active");
      currentFieldset++;
      next_fs.show();
      let left, opacity, scale;
      current_fs.animate(
        { opacity: 0 },
        {
          step: function (now, mx) {
            scale = 1 - (1 - now) * 0.2;
            left = now * 50 + "%";
            opacity = 1 - now;
            current_fs.css({
              transform: "scale(" + scale + ")",
              position: "absolute"
            });
            next_fs.css({ left: left, opacity: opacity });
          },
          duration,
          complete: function () {
            current_fs.hide();
            animating = false;
            resolve();
          },
          easing: "easeInOutBack"
        }
      );
    });
  }

  return {
    previous,
    next,
    getCurrentFieldset,
    setCurrentFieldset
  }
}();

$(".next").click(Steps.next);
$(".previous").click(Steps.previous);
$("[data-fieldset-target]").click(async function (event) {
  const target = event.target.dataset.fieldsetTarget;
  Steps.setCurrentFieldset(target)
});

$(".submit").click(function () {
  return false;
});
