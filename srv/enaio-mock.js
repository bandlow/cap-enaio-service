const cds = require('@sap/cds');
const LOG = cds.log('enaio-mock');

module.exports = {
  async uploadDocument(metaInfo, file) {
    LOG.info('MOCK uploadDocument:', metaInfo);
    return {
      success: true,
      documentId: 'MOCK-' + Date.now(),
      metaInfo,
      fileSize: file ? (file.length * 3 / 4).toString() : '0'
    };
  },
  
  async searchDocuments(criteria) {
    LOG.info('MOCK searchDocuments:', criteria);
    return {
      documents: [],
      count: 0,
      criteria
    };
  }
};
