importScripts(
  'src/background/useCases/sheets/GetGoogleSheetsConfig.js',
  'src/background/shared/GoogleDrive.js',
  'src/background/shared/GoogleSheets.js',
);

var LinkedInController = function () {
  let activeTabId = '';

  async function getSheetId() {
    const sheetsInfo = await new StorageGet().execute({
      params: {
        key: 'sheets'
      }
    })
    if (!sheetsInfo.sheets) {
      return "";
    }
    return sheetsInfo.sheets.id;
  }

  async function getDriveFolderId() {
    const driveInfo = await new StorageGet().execute({
      params: {
        key: 'drive'
      }
    })
    if (!driveInfo.drive || !driveInfo.drive.folder) {
      return "";
    }
    return driveInfo.drive.folder.id;
  }

  async function saveLinkedInData() {
    const driveFolderId = await getDriveFolderId();
    const spreadsheetId = await getSheetId();
    const sheetsConfig = await GetGoogleSheetsConfig.execute();
    const linkedInData = await getLinkedInData();
    console.log('linkedInData:', linkedInData);

    const googleDrive = new GoogleDrive(sheetsConfig);
    const requestFile = await fetch(linkedInData.resumeLink);
    const blobFile = await requestFile.blob();

    const uploadResponse = await googleDrive.upload(blobFile, linkedInData.name, [driveFolderId])
    if (uploadResponse && uploadResponse.id) {
      await googleDrive.setPermissions(uploadResponse.id, 'reader', 'anyone');
    }
    const fileLink = await googleDrive.getFileWebViewLink(uploadResponse.id);

    const level = linkedInData.questions.find((question) => {
      return question.question == "Levando em consideração os requisitos da vaga e suas experiências, qual nível melhor te define para esta candidatura? (1) Júnior (2) Júnior com experiência (3) Pleno (4) Sênior";
    })
    const experiencia = linkedInData.questions.find((question) => {
      return question.question == "Quantos MESES de experiência profissional você possui na tecnologia NODE?";
    })
    const inicioImediato = linkedInData.questions.find((question) => {
      return question.question == "Precisamos preencher esta posição com urgência. Você poderia começar imediatamente?";
    })
    const remoto = linkedInData.questions.find((question) => {
      return question.question == "Você trabalharia remotamente?";
    })
    const pretensao = linkedInData.questions.find((question) => {
      return question.question == "Levando em consideração a vaga em questão, qual sua pretensão salarial?";
    })
    const presencial = linkedInData.questions.find((question) => {
      return question.question == "Você trabalharia presencialmente?";
    })

    const googleSheets = new GoogleSheets(sheetsConfig);
    const firstColumnValues = await googleSheets.getValuesByRange(spreadsheetId, 'Página1!A3:A1000');
    const lastRowIndex = firstColumnValues.values ? firstColumnValues.values.length + 2 : 2;

    const values = [
      {
        "userEnteredValue": {
          "stringValue": linkedInData.name
        },
        "textFormatRuns": [
          {
            "startIndex": "0",
            "format": {
              "link": {
                "uri": fileLink
              }
            }
          }
        ]
      },
      {
        "userEnteredValue": {
          "stringValue": linkedInData.email
        }
      },
      {
        "userEnteredValue": {
          "stringValue": linkedInData.phone
        }
      },
      {
        "userEnteredValue": {
          "stringValue": ""
        }
      },
      {
        "userEnteredValue": {
          "stringValue": level.answer
        }
      },
      {
        "userEnteredValue": {
          "stringValue": experiencia.answer
        }
      },
      {
        "userEnteredValue": {
          "stringValue": ""
        }
      },
      {
        "userEnteredValue": {
          "boolValue": inicioImediato.answer == "Sim"
        }
      },
      {
        "userEnteredValue": {
          "stringValue": ""
        }
      },
      {
        "userEnteredValue": {
          "boolValue": presencial.answer == "Sim"
        }
      },
      {
        "userEnteredValue": {
          "boolValue": remoto.answer == "Sim"
        }
      },
      {
        "userEnteredValue": {
          "stringValue": pretensao.answer
        }
      },
    ]

    const range = {
      "startColumnIndex": 0,
      "endColumnIndex": values.length + 1,
      "startRowIndex": lastRowIndex,
      "endRowIndex": lastRowIndex + 1,
      "sheetId": 0
    }

    const fields = 'userEnteredValue,textFormatRuns';

    const data = await googleSheets.updateCells(spreadsheetId, range, values, fields);
    return {
      status: 'SUCCESS',
      data: linkedInData
    }
  }


  chrome.tabs.onActivated.addListener(function(activeInfo) {
    activeTabId = activeInfo.tabId;
  })

  async function getLinkedInData() {
    return await new Promise(function (resolve) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if(tabs && tabs.length > 0 && tabs[0].id){
          activeTabId = tabs[0].id;
        }
        chrome.tabs.sendMessage(activeTabId, { route: 'currentCandidateInfo' }, function (res) {
          resolve(res);
        });
      })
    });
  }

  return {
    saveLinkedInData
  }
}();

