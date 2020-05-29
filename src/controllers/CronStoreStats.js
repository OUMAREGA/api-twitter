const cron = require("node-cron");

exports.store = () => { 
    cron.schedule('* * * * *', () =>  {
        console.log('Yoyo senior');
      });
};