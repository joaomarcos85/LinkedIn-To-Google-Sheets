importScripts(
  'src/background/useCases/auth/GetGoogleAuthConfig.js',
  'src/background/useCases/auth/RefreshGoogleAccessToken.js'
);

var GoogleDrive = function (driveConfig) {

  async function upload(binaryFile, fileName, parents) {
    const metadata = {
      name: fileName,
      parents: parents
    }
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json'
    });

    const formData = new FormData();
    formData.append("file", binaryFile);
    formData.append('metadata', metadataBlob);

    const requestOptions = {
      method: 'POST',
      headers: await getHeaders(),
      body: formData,
      redirect: 'follow'
    };

    const url = `https://www.googleapis.com/upload/drive/v3/files`;
    const response = await request(url, requestOptions);
    return response;
  }

  async function setPermissions(fileId, role, type) {
    const body = {
      role: role,
      type: type
    };
    const requestOptions = {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body),
      redirect: 'follow'
    };

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
    const response = await request(url, requestOptions);
    return response;
  }

  async function getFileWebViewLink(fileId) {
    const queryParams = new URLSearchParams({
      fields: 'webViewLink'
    })
    const requestOptions = {
      method: 'GET',
      headers: await getHeaders(),
      redirect: 'follow'
    };
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?${queryParams}`;
    const response = await request(url, requestOptions);
    if (response && response.webViewLink) {
      return response.webViewLink;
    }
    return '';
  }

  async function getHeaders() {
    return {
      Authorization: `Bearer ${driveConfig.access_token}`
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
    driveConfig.access_token = authorizationInfo.access_token;
    const newHeader = await getHeaders();
    requestOptions.headers = { ...requestOptions.headers, newHeader };
  }

  return {
    upload,
    setPermissions,
    getFileWebViewLink
  }

};