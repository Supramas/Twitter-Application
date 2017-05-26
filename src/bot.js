'use strict'
// Dependencies =========================
const Twit = require('twit')
const ura = require('unique-random-array')
const config = require('./config')
const strings = require('./helpers/strings')
const sentiment = require('./helpers/sentiment')

const Twitter = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
})

// Frequency
const retweetFrequency = config.twitter.retweet
const favoriteFrequency = config.twitter.favorite
//  username
const username = config.twitter.username

// RANDOM QUERY STRING  =========================

let qf = ura(strings.queryFrom)
let qs = ura(strings.queryString)
let qsSq = ura(strings.queryStringSubQuery)
let rt = ura(strings.resultType)
let rs = ura(strings.responseString)

// https://dev.twitter.com/rest/reference/get/search/tweets
// A UTF-8, URL-encoded search query of 500 characters maximum, including operators.
// Queries may additionally be limited by complexity.

// to get yesterday date
var yesterday = new Date()
var dd = yesterday.getDate()-1
var mm = yesterday.getMonth()+1 //January is 0!
var yyyy = yesterday.getFullYear()
if(dd<10) {
    dd='0'+dd
} 
if(mm<10) {
    mm='0'+mm
} 
yesterday = yyyy+'-'+mm+'-'+dd

// PHOTO TWEET BOT ==========================
let phototweet = function () {
  var paramQS = qs()
  //paramQS += qsSq()
  //var paramRT = rt()
  var paramFrom = 'Sport__WAGs'
  var params = {
    q: paramBls(),
    //result_type: paramRT,
    lang: 'en',
    from: paramFrom
  }

  Twitter.get('search/tweets', params, function (err, data) {
    if (!err) { // if there no errors
      try {
        // grab ID of tweet to retweet
        // run sentiment check ==========
        var tweets = data.statuses
        var randomTweet = ranDom(tweets) // pick a random tweet

        var mytweetId = randomTweet.id_str
        var mytweetText = randomTweet.text

        console.log('Number of Tweet = ',tweets.length)

        // setup http call
        var httpCall = sentiment.init()

        httpCall.send('txt=' + mytweetText).end(function (result) {
          //var sentim = result.body.result.sentiment
          var sentim = 'Negative'
          //var confidence = parseFloat(result.body.result.confidence)
          var confidence = 75
          console.log(confidence, sentim)
          // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('PHOTO TWEET NEG NEG NEG', sentim, mytweetText)
            return
          }
        })
      } catch (e) {
        console.log('phototweetId DERP!', e.message, 'Query From:', paramFrom)
        return
      }
      // Tell TWITTER to tweet
      Twitter.post('statuses/update', {
        status: mytweetText
      }, function (err, response) {
        if (response) {
          console.log('PHOTO TWEETED!', ' Query From:', paramFrom, ' String:', mytweetText)
        }
                // if there was an error while tweeting
        if (err) {
          console.log('PHOTO TWEET ERROR! Duplication maybe...:', err, 'Query From:', paramFrom)
        }
      })
      
      
    } else { console.log('Something went wrong while SEARCHING...') }
  })
}

// retweet on bot start
phototweet()
// tweet in every x minutes
setInterval(phototweet, 1000 * 60 * 360)


// TWEET BOT ==========================
let mytweet = function () {
  var paramQS = qs()
  //paramQS += qsSq()
  //var paramRT = rt()
  var paramRT = 'mixed'
  var paramFrom = qf()
  var params = {
    q: paramBls(),
    result_type: paramRT,
    lang: 'id',
    since: yesterday,
    from: paramFrom
  }

  Twitter.get('search/tweets', params, function (err, data) {
    if (!err) { // if there no errors
      try {
        // grab ID of tweet to retweet
        // run sentiment check ==========
        var mytweetId = data.statuses[0].id_str
        var mytweetText = data.statuses[0].text

        // setup http call
        var httpCall = sentiment.init()

        httpCall.send('txt=' + mytweetText).end(function (result) {
          //var sentim = result.body.result.sentiment
          var sentim = 'Negative'
          //var confidence = parseFloat(result.body.result.confidence)
          var confidence = 75
          console.log(confidence, sentim)
          // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('TWEET NEG NEG NEG', sentim, mytweetText)
            return
          }
        })
      } catch (e) {
        console.log('tweetId DERP!', e.message, 'Query From:', paramFrom)
        return
      }
      // Tell TWITTER to tweet
      Twitter.post('statuses/update', {
        status: mytweetText
      }, function (err, response) {
        if (response) {
          console.log('TWEETED!', ' Query From:', paramFrom)
        }
                // if there was an error while tweeting
        if (err) {
          console.log('TWEET ERROR! Duplication maybe...:', err, 'Query From:', paramFrom)
        }
      })
    } else { console.log('Something went wrong while SEARCHING...') }
  })
}

// tweet on bot start
mytweet()
// tweet in every x minutes
setInterval(mytweet, 1000 * 60 * 180)

// RETWEET BOT ==========================

// find latest tweet according the query 'q' in params

// result_type: options, mixed, recent, popular
// * mixed : Include both popular and real time results in the response.
// * recent : return only the most recent results in the response
// * popular : return only the most popular results in the response.

let retweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var paramFrom = null
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'id',
    since: yesterday
  }

  Twitter.get('search/tweets', params, function (err, data) {
    if (!err) { // if there no errors
      try {
        // grab ID of tweet to retweet
        // run sentiment check ==========

        var tweets = data.statuses
        var randomTweet = ranDomT(tweets) // pick a random tweet

        var retweetId = randomTweet.id_str
        var retweetText = randomTweet.text

        // setup http call
        var httpCall = sentiment.init()
        
        httpCall.send('txt=' + retweetText).end(function (result) {
          //var sentim = result.body.result.sentiment
          var sentim = 'Negative'
          //var confidence = parseFloat(result.body.result.confidence)
          var confidence = 75
          console.log(confidence, sentim)
          // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('RETWEET NEG NEG NEG', sentim, retweetText)
            return
          }
        })
      } catch (e) {
        console.log('retweetId DERP!', e.message, ' Query String: ', paramQS, ' Id: ', retweetId)
        return
      }
      
            // Tell TWITTER to retweet
      Twitter.post('statuses/retweet/:id', {
        id: retweetId
      }, function (err, response) {
        if (response) {
          console.log('RETWEETED!', ' Query String:', paramQS)
        }
                // if there was an error while tweeting
        if (err) {
          console.log('RETWEET ERROR! Duplication maybe...:', err, 'Query String:', paramQS)
        }
      })
    } else { console.log('Something went wrong while SEARCHING...') }
  })
}

// retweet on bot start
retweet()
// retweet in every x minutes
setInterval(retweet, 1000 * 60 * 15)

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'id'
  }

    // find the tweet
  Twitter.get('search/tweets', params, function (err, data) {
    if (err) {
      console.log(`ERR CAN'T FIND TWEET:`, err)
    } else {
        // find tweets
      var tweet = data.statuses
      var randomTweet = ranDom(tweet) // pick a random tweet

        // if random tweet exists
      if (typeof randomTweet !== 'undefined') {
            // run sentiment check ==========
            // setup http call
        var httpCall = sentiment.init()
        var favoriteText = randomTweet['text']

        httpCall.send('txt=' + favoriteText).end(function (result) {
          //var sentim = result.body.result.sentiment
          var sentim = 'Negative'
          //var confidence = parseFloat(result.body.result.confidence)
          var confidence = 75
          console.log(confidence, sentim)
        // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('FAVORITE NEG NEG NEG', sentim, favoriteText)
            return
          }
        })

            // Tell TWITTER to 'favorite'
        Twitter.post('favorites/create', {
          id: randomTweet.id_str
        }, function (err, response) {
                // if there was an error while 'favorite'
          if (err) {
            console.log('CANNOT BE FAVORITE... Error: ', err, ' Query String: ' + paramQS)
          } else {
            console.log('FAVORITED... Success!!!', ' Query String: ' + paramQS)
          }
        })
      }
    }
  })
}

// favorite on bot start
favoriteTweet()
    // favorite in every x minutes
setInterval(favoriteTweet, 1000 * 60 * favoriteFrequency)

// STREAM API for interacting with a USER =======
// set up a user stream
var stream = Twitter.stream('user')

// REPLY-FOLLOW BOT ============================

// what to do when someone follows you?
stream.on('follow', followed)

// ...trigger the callback
function followed (event) {
  console.log('Follow Event now RUNNING')
        // get USER's twitter handle (screen name)
  var screenName = event.source.screen_name

    // CREATE RANDOM RESPONSE  ============================
  var responseString = rs()
  var find = 'screenName'
  var regex = new RegExp(find, 'g')
  responseString = responseString.replace(regex, screenName)

  // function that replies back to every USER who followed for the first time
  console.log(responseString)
  tweetNow(responseString)
}

// function definition to tweet back to USER who followed
function tweetNow (tweetTxt) {
  var tweet = {
    status: tweetTxt
  }

  const screenName = tweetTxt.search(username)

  if (screenName !== -1) {
    console.log('TWEET SELF! Skipped!!')
  } else {
    Twitter.post('statuses/update', tweet, function (err, data, response) {
      if (err) {
        console.log('Cannot Reply to Follower. ERROR!: ' + err)
      } else {
        console.log('Reply to follower. SUCCESS!')
      }
    })
  }
}

// function to generate a random tweet tweet
function ranDom (arr) {
  var index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

function ranDomT (arr) {
  var index = Math.floor(Math.random() * 3)
  return arr[index]
}

function paramBls () {
  var ret = ''
  var arr = strings.blockedStrings
  var i
  var n
  for (i = 0, n = arr.length; i < n; i++) {
    ret += ' -' + arr[i]
  }
  return ret
}
