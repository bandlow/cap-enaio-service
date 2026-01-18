import cds from '@sap/cds';
import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import { getDestination } from '@sap-cloud-sdk/connectivity';

export default cds.service.impl(async function () {
  /**
   * Health-Check: Ruft NUR die Base-URL auf (je nach Base: "/" oder "/osrest/api"),
   * um Tunnel, Location ID, Auth und Basis-Erreichbarkeit zu prüfen.
   */
  this.on('PingOnPrem', async (req) => {
    try {
      const destination = await getDestination({
        destinationName: 'enaio-destination',
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
        destinationName: 'enaio-destination',
        useCache: false
      });

      if (!destination) return req.error(502, 'Destination not found');

      const base = (destination.url || '').replace(/\/+$/, '');
      // Auto-Suffix: Wenn Base schon /osrest/api ist -> /serviceinfo, sonst kompletter Pfad
      const suffix = base.endsWith('/osrest/api') ? '/serviceinfo' : '/osrest/api/serviceinfo';

      req.warn(`ServiceInfo -> base: ${base}, url: ${suffix}, auth: ${destination.authentication}, proxy: ${destination.proxyConfiguration?.proxyType}, locationId: ${destination.proxyConfiguration?.headers?.['SAP-Connectivity-SCC-Location_ID']}`);

      const response = await executeHttpRequest(destination, {
        method: 'get',
        url: suffix,
        headers: { Accept: 'application/json' }
      });

      return JSON.stringify(response.data);

    } catch (e) {
      console.error('status:', e.statusCode, e.message)
      console.error('rootCause:', e?.rootCause?.message || e?.cause?.message)
      if (e.response) {
        console.error('resp headers:', e.response.headers)
        console.error('resp data:', e.response.data) // <- hier steht oft die CC/Proxy-Fehlermeldung
      }
      throw e
    }
  });
});
