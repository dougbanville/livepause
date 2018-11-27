/* eslint-disable  func-names */
/* eslint-disable  no-console */
//https://youtu.be/QkbXjknPoXc?t=2759
const Alexa = require('ask-sdk-core');
const moment = require('moment');
const apiRequest = require('./apiRequest')


const STREAMS = [
  {
    "token": "stream-12",
    "url": 'https://sgrewind.streamguys1.com/rte/radio1/playlist_dvr_range-1542870005-60.m3u8',
    "metadata" : {
      "title": "Radio One",
      "subtitle": "A subtitle for stream one",
      "art": {
        "sources": [
          {
            "contentDescription": "example image",
            "url": "https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png",
            "widthPixels": 512,
            "heightPixels": 512
          }
        ]
      },
      "backgroundImage": {
        "sources": [
          {
            "contentDescription": "example image",
            "url": "https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png",
            "widthPixels": 1200,
            "heightPixels": 800
          }
        ]
      }
    }
  }
];

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
        (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent') ||
        (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent');
  },
  async handle(handlerInput) {
    const schedule = await apiRequest.httpGet("feeds.rasset.ie","/livelistings/listing/?channelid=9&output=json")
    console.log(schedule[0].AdsTitle);
    let showName =schedule[0].AdsTitle;
    let channel = schedule[0].channel;
    let stream = STREAMS[0];
    let timeStamp = moment.utc().subtract(10,"seconds").format("X");
    let duration = 10
    let streamUrl = `https://sgrewind.streamguys1.com/rte/radio1/playlist_dvr_timeshift-10-10.m3u8`;
    console.log(streamUrl)
    handlerInput.responseBuilder
      .speak(`${showName} on ${channel}`)
      //addAudioPlayerPlayDirective(playBehavior: interfaces.audioplayer.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string, audioItemMetadata? : AudioItemMetadata): 
      .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stream.token, 0, stream.token, stream.metadata)
      .withSimpleCard('RTE', "Yo!");
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const playFromStart = {

  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
    && request.intent.name === 'playFromStart';
    
  },

  async handle(handlerInput) {
    const schedule = await apiRequest.httpGet("feeds.rasset.ie","/livelistings/listing/?channelid=9&output=json")
    console.log(schedule[0].AdsTitle);
    let showName =schedule[0].AdsTitle;
    let channel = schedule[0].channel;
    let start = moment(schedule[0].progDate);
    console.log(start.format("X"));
    let duration = moment.duration(schedule[0].duration,"minutes").asSeconds();
    console.log(duration)
    let stream = STREAMS[0];
    let timeStamp = moment.utc().subtract(10,"seconds").format("X");
    //let duration = 10
    let streamUrl = `https://sgrewind.streamguys1.com/rte/radio1/playlist_dvr_range-${start.format("X")}-${schedule[0].duration}.m3u8`;
    //console.log(streamUrl)
    handlerInput.responseBuilder
      .speak(`${showName} on ${channel}`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();
  },


};

const rewindIntent = {

  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
    && request.intent.name === 'rewindIntent';
    
  },
  handle(handlerInput){
    let stream = STREAMS[0];

    let minutes = handlerInput.requestEnvelope.request.intent.slots.minutes.value;
    const speechText = `Rewinding ${minutes} ${handlerInput.requestEnvelope.request.intent.slots.minutes.name}`;

    let timeStamp = moment().subtract(minutes,"minutes").format("X");
    let duration = moment.duration(parseInt(minutes),"minutes").asSeconds()

    let streamUrl = `https://sgrewind.streamguys1.com/rte/radio1/playlist_dvr_range-${timeStamp}-${duration}.m3u8`;
    console.log(streamUrl)
    return handlerInput.responseBuilder
    .speak(speechText)
    .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stream.token, 0, null, "", stream.metadata)
    .getResponse();

  }


};

const getLatest = {

  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
    && request.intent.name === 'getLatest';
    
  },

  async handle(handlerInput) {
    const topic  = await apiRequest.httpGet(`us-central1-radio-a8e0f.cloudfunctions.net`,`/flashBriefing?category=news`)
    console.log(topic[0].streamUrl)
    let stream = STREAMS[0];
    //let duration = 10
    let streamUrl = topic[0].streamUrl;
    //console.log(streamUrl)
    handlerInput.responseBuilder
      .speak(`${topic[0].titleText}`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();
  },


};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill just plays an audio stream when it is started. It does not have any additional functionality.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is an audio starter template from skill templates dot com';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {

    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    //should save details so play can be resumed. 
    return true;
  },
};

//AudioPlayer.PlaybackStarted
const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

//System.ExceptionEncountered
const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    playFromStart,
    getLatest,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
    rewindIntent 
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
