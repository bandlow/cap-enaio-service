const cds = require('@sap/cds');
const { GET } = cds.test('serve', '--in-memory');

describe('Debug Service', () => {

  it('should show service metadata', async () => {
    const response = await GET('/odata/v4/enaio/$metadata');
    console.log('Metadata status:', response.status);
    expect(response.status).toBe(200);
  });

  it('should show service document', async () => {
    const response = await GET('/odata/v4/enaio/');
    console.log('Service document status:', response.status);
    expect(response.status).toBe(200);
  });

});
