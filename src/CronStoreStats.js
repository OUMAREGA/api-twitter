const cron = require("node-cron");
const Keyword = require('./models/KeywordModel');
const Stats = require('./controllers/StatsKeywordController');
const fetch = require('node-fetch')
const moment = require('moment-timezone');
const generateBearerToken = require('./util/generateBearerToken')


exports.store = async () => { 
 
  cron.schedule('*/10 * * * *', async () =>  {

    const token = await generateBearerToken();


    let today = new Date();
    let intervalle = 10;
    let start_time = today;
    let end_time = today;

    end_time.setMinutes(end_time.getMinutes()-1)
    end_time = end_time.toISOString();
    
    start_time.setMinutes(today.getMinutes()-intervalle)
    start_time = start_time.toISOString();

    //start_time = start_time.toISOString();




    Keyword.find().select(["word"]).then(
      resp => {
        resp.forEach(async (item) => {

          await fetch(`https://api.twitter.com/labs/2/tweets/search?start_time=${start_time}&end_time=${end_time}&max_results=100&tweet.fields=created_at&query=%23${item.word}`, {
            method: "GET",
            headers: {
                "Authorization": token
            }
        }).then(res => res.json()) // expecting a json response
        .then( async (json) =>  {

          let nb_tweets = json.meta.result_count;
           let next_token = json.meta.next_token
           if(next_token)
           {
              let next = true;
              end_time = json.data[0].created_at;
              while(next)
              {

                await fetch("https://api.twitter.com/labs/2/tweets/search?start_time="+start_time+"&end_time="+end_time+"&max_results=100&tweet.fields=created_at&query=%23"+item.word, {
                  method: "GET",
                  headers: {
                      "Authorization": token
                  }
              }).then(res => res.json()).then(json => {

                nb_tweets += json.meta.result_count;

                end_time = json.data[0].created_at;

                if(!json.meta.next_token)
                  next = false;

              })

              }

           }
          
           let req = {}

           const dateParis = moment.tz(Date.now(), "Europe/Paris")
          
           req.body = {
            "keyword": item.word,
            "nb_tweets" : nb_tweets,
            "date": dateParis
          }

          Stats.create_keyword_stat(req)
           
        });


        
        });
      });


  });
};
// https://api.twitter.com/labs/2/tweets/search?start_time=2020-05-25T15:00:00.000Z&end_time=2020-05-25T15:00:30.000Z&max_results=100&tweet.fields=created_at&query=%23covid
