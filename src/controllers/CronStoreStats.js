const cron = require("node-cron");

exports.store = () => { 
    cron.schedule('*/10 * * * *', () =>  {
        console.log('Yoyo senior');
      });
};