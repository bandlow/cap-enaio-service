const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');

module.exports = async function() {
  const service = await cds.connect.to('Enaio');
  cds.log('enaio')('Connected to real Enaio API...');

  return {
    async uploadDocument(metaInfo, file) {
      // Echter API-Call
      const response = await executeHttpRequest({
        method: 'GET',
        url: `${service.options.credentials.url}/osrest/api/serviceinfo`
      });
      return response.data;
    }
  };
};
