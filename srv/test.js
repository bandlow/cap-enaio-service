const cds = require('@sap/cds');
(async()=>{
  try {
    const res = await cds.connect.to('enaio').get('/osrest/api/serviceinfo');
    console.log('✅ ENAIO OK:', res);
  } catch(e) {
    console.error('❌', e.message);
  }
})();
