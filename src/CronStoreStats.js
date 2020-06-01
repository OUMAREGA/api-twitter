const cron = require("node-cron");
const Keyword = require('./models/KeywordModel');
const Stats = require('./controllers/StatsKeywordController');
const fetch = require('node-fetch')


exports.store = async () => { 
 
  cron.schedule('*/10 * * * *', async () =>  {

    let today = new Date();
    let intervalle = 10;
    let start_time = today;
    let end_time = today;

    end_time.setMinutes(end_time.getMinutes()-1)
    end_time = end_time.toISOString();
    
    start_time.setMinutes(today.getMinutes()-intervalle)
    start_time = start_time.toISOString();

    //start_time = start_time.toISOString();


    console.log({start_time, end_time})

    Keyword.find().select(["word"]).then(
      resp => {
        resp.forEach(async (item) => {

          console.log("res",item.word, start_time)

          await fetch(`https://api.twitter.com/labs/2/tweets/search?start_time=${start_time}&end_time=${end_time}&max_results=100&tweet.fields=created_at&query=%23${item.word}`, {
            method: "GET",
            headers: {
                "Authorization": process.env.TOKEN
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
                      "Authorization": process.env.TOKEN
                  }
              }).then(res => res.json()).then(json => {

                nb_tweets += json.meta.result_count;

                end_time = json.data[0].created_at;

                if(!json.meta.next_token)
                  next = false;

              })

              }//end while

           }
           else{
             console.log("pas de next_toke")
           }

          // console.log("nbt",nb_tweets  )
           let req = {}
          
           req.body = {
            "keyword": item,
            "nb_tweets" : nb_tweets
          }

          Stats.create_keyword_stat(req)
           
        });


        
        });
      });


  });
};

// https://api.twitter.com/labs/2/tweets/search?start_time=2020-05-25T15:00:00.000Z&end_time=2020-05-25T15:00:30.000Z&max_results=100&tweet.fields=created_at&query=%23covid