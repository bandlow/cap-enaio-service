import cds from '@sap/cds';
import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import { getDestination } from '@sap-cloud-sdk/connectivity';

export default cds.service.impl(async function () {
  /**
   * Health-Check: Ruft NUR die Base-URL auf (je nach Base: "/" oder "/osrest/api"),
   * um Tunnel, Location ID, Auth und Basis-Erreichbarkeit zu prüfen.
   */
  this.on('PingOnPrem', async (req) => {
    const destinationName = process.env.ENAIO_DESTINATION_NAME || 'enaio-test';
    try {
      const destination = await getDestination({
        destinationName,
        useCache: false
      });

      if (!destination) return req.error(502, 'Destination not found');

      const base = (destination.url || '').replace(/\/+$/, '');
      // Wenn Base schon /osrest/api enthält, pingen wir "/"; sonst "/osrest/api"
      const suffix = base.endsWith('/osrest/api') ? '/' : '/osrest/api';

      req.warn(`Ping -> base: ${base}, url: ${suffix}, auth: ${destination.authentication}, proxy: ${destination.proxyConfiguration?.proxyType}, locationId: ${destination.proxyConfiguration?.headers?.['SAP-Connectivity-SCC-Location_ID']}`);

      const response = await executeHttpRequest(destination, {
        method: 'get',
        url: suffix,
        headers: { Accept: 'application/json' }
      });

      return JSON.stringify({
        ok: true,
        baseUrl: base,
        requested: suffix,
        status: 200,
        body: response.data
      });
    } catch (e) {
      const status = e?.rootCause?.response?.status;
      const statusText = e?.rootCause?.response?.statusText;
      const body = e?.rootCause?.response?.data;

      req.warn(`PingOnPrem failed: ${e.message}`);
      if (status || statusText) req.warn(`HTTP ${status} ${statusText}`);
      if (body) req.warn(`Response: ${typeof body === 'string' ? body : JSON.stringify(body)}`);

      return req.error(502, `Ping failed${status ? ` (HTTP ${status})` : ''}`);
    }
  });

  /**
   * Holt /osrest/api/serviceinfo. Mit Auto-Suffix, damit es keine Pfadduplikate gibt,
   * egal ob die Destination-Base-URL bereits /osrest/api enthält oder nicht.
   */
  this.on('ServiceInfo', async (req) => {
  try {
    const destination = await getDestination({
      destinationName: 'enaio-test',
      useCache: false
    });

    if (!destination) return req.error(502, 'Destination not found');

    const base = (destination.url || '').replace(/\/+$/, '');
    const suffix = base.endsWith('/osrest/api') ? '/serviceinfo' : '/osrest/api/serviceinfo';

    // Location ID aus der Destination auslesen und in Headers setzen
    const locationId = destination.cloudConnectorLocationId || 'azure-dev-qual';
    
    const headers = {
      Accept: 'application/json',
      Connection: 'close',
      'SAP-Connectivity-SCC-Location_ID': locationId  // ← Das fehlt!
    };

    req.warn(`ServiceInfo -> base: ${base}, url: ${suffix}, locationId: ${locationId}`);

    const response = await executeHttpRequest(destination, {
      method: 'get',
      url: suffix,
      headers: headers,
      timeout: 30000
    });

    return JSON.stringify(response.data);

  } catch (e) {
    req.error(`Error: ${e.message}, Code: ${e.code}`);
    if (e.response) {
      req.error(`Response status: ${e.response.status}, data: ${JSON.stringify(e.response.data)}`);
    }
    throw e;
  }
});


  // Custom GET endpoint (kein OData)
  this.on('READ', 'DebugDestination', async (req) => {
  try {
    const destination = await getDestination({
      destinationName: 'enaio-test',
      useCache: false
    });

    // Passwort ausblenden
    const safeDestination = { ...destination };
    if (safeDestination.password) safeDestination.password = '[HIDDEN]';
    if (safeDestination.headers?.authorization) safeDestination.headers.authorization = '[HIDDEN]';

    console.log('=== RAW DESTINATION ===');
    console.log(JSON.stringify(safeDestination, null, 2));

    return [{
      raw: JSON.stringify(safeDestination, null, 2)
    }];
    
  } catch (e) {
    return req.error(500, e.message);
  }
});


});
