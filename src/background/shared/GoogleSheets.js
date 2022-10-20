importScripts(
  'src/background/useCases/auth/GetGoogleAuthConfig.js',
  'src/background/useCases/auth/RefreshGoogleAccessToken.js'
);

var GoogleSheets = function (sheetsConfig) {

  async function getValuesByRange(spreadsheetId, range) {
    const requestOptions = {
      method: 'GET',
      headers: await getHeaders(),
      redirect: 'follow'
    };

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    const response = await request(url, requestOptions);
    return response;
  }

  async function append(spreadsheetId, range, values) {
    const body = JSON.stringify({
      "values": values
    });

    const requestOptions = {
      method: 'POST',
      headers: await getHeaders(),
      body: body,
      redirect: 'follow'
    };

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const response = await request(url, requestOptions);
    return response;
  }

  async function updateCells(spreadsheetId, range, values, fields) {
    const body = JSON.stringify(
      {
        "requests": [
          {
            "updateCells": {
              "rows": {
                values
              },
              range,
              fields
            }
          }

        ]
      }
    );
    const requestOptions = {
      method: 'POST',
      headers: await getHeaders(),
      body: body,
      redirect: 'follow'
    };

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const response = await request(url, requestOptions);
    return response;
  }

  async function getHeaders() {
    return {
      Authorization: `Bearer ${sheetsConfig.access_token}`,
      "Content-Type": "application/json"
    };
  }

  async function request(url, requestOptions, attempts = 2) {
    const data = await fetch(url, requestOptions);
    const response = await data.json();

    if (!response.error) {
      return response;
    }
    if (attempts > 0) {
      attempts--;
    } else {
      return response;
    }

    if (response.error.code == 401) {
      await validateAuthError(url, requestOptions, response)
    }
    return request(url, requestOptions, attempts);
  }

  async function validateAuthError(url, requestOptions, response) {
    const googleConfig = await new GetGoogleAuthConfig().execute();
    const authorizationInfo = await RefreshGoogleAccessToken(googleConfig).execute();
    sheetsConfig.access_token = authorizationInfo.access_token;
    requestOptions.headers = await getHeaders();
  }

  return {
    getValuesByRange,
    append,
    updateCells
  }

};