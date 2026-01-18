const cds = require('@sap/cds');

// KORREKT: cds.test() returned expect + POST
const { POST, expect } = cds.test();  // ← expect destrukturieren!

describe('EnaioService Tests', () => {
  it('should fetch service info', async () => {
    const res = await POST('/odata/v4/enaio/getServiceInfo');
    
    expect(res.status).to.equal(200);
    expect(res.data.apiVersion).to.equal('1.7.191');
    expect(res.data.version).to.equal('11.10');
    expect(res.data.documentViewerUrl).to.contain('enaiotest.skf.net');
  });

  it('should expose capabilities', async () => {
    const res = await POST('/odata/v4/enaio/getServiceInfo');
    expect(res.data.capabilities.length).to.be.greaterThan(20);
    expect(res.data.capabilities).to.deep.include({ name: 'Workflow', value: 'true' });
  });
});
