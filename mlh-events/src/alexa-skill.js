'use strict';

const fetchHackathons = require('./fetch-hackathons');
const presentHackathons = require('./present-hackathons');
const { calculateScrollWindow } = require('./utils');
const alexa = require('alexa-app');
const app = new alexa.app('mlh-events');

const { ERROR_RES, DEFAULT_RES, HACK_LIMIT } = require('./constants');

function errorHandler(error, res) {
  if (error) {
    console.log(error);
    return res.clear().say(ERROR_RES).send();
  }
}

const defaultHaltHandler = (req, res) => res.say(DEFAULT_RES);

app.post = (req, res, type, error) => errorHandler(error, res);
app.error = (error, req, res) => errorHandler(error, res);

app.launch((req, res) => {
  let initialOutput = 'This skill is for retrieving the latest MLH hackathons.';
  let repromptOutput = "Just ask me 'What are the latest hackathons within the next month?'";
  return res
    .say(initialOutput + ' ' + repromptOutput)
    .reprompt(repromptOutput)
    .shouldEndSession(false);
});

app.intent('AMAZON.HelpIntent', (req, res) => {
  let initialHelpOutput = 'This skill is for retrieving the latest MLH hackathons.';
  let helpOutput = [
    "You can ask, 'what are the latest hackathons within the next month?' or 'latest hackathons by tomorrow'",
    'You can also say stop or exit to quit.'
  ].join(' ');
  return res
    .say(initialHelpOutput + ' ' + helpOutput)
    .reprompt(helpOutput)
    .shouldEndSession(false);
});

app.intent('AMAZON.StopIntent', defaultHaltHandler);
app.intent('AMAZON.CancelIntent', defaultHaltHandler);
app.intent('AMAZON.FallbackIntent', (req, res) => errorHandler('Unable to handle given intent!', res));

function hackathonHandlerNoScroll(hsOnly) {
  return async (req, res) => {
    let session = req.getSession();

    let hackathons = await fetchHackathons(hsOnly);
    let [start, end] = [0, HACK_LIMIT];

    session.set('hs', hsOnly);
    session.set('start', start);
    session.set('end', end);

    let futureDate = req.slot('futureDate');
    if (futureDate) {
      let speech = presentHackathons(hackathons, futureDate, start, end);
      return res.say(speech).shouldEndSession(false);
    } else {
      let failMsg = "It seems like the provided time frame was not valid. Try a valid one, like 'next month' or 'next year";
      return res.say(failMsg).shouldEndSession(false);
    }
  };
}

function hackathonHandlerWithScroll(scroll) {
  return async (req, res) => {
    let session = req.getSession();

    let hsOnly = session.get('hs');
    let start = session.get('start');
    let end = session.get('end');

    let hackathons = await fetchHackathons(hsOnly);
    [start, end] = calculateScrollWindow(hackathons, start, end, scroll);

    session.set('hs', hsOnly);
    session.set('start', start);
    session.set('end', end);

    let futureDate = req.slot('futureDate');
    if (futureDate) {
      let speech = presentHackathons(hackathons, futureDate, start, end);
      return res.say(speech).shouldEndSession(false);
    } else {
      let failMsg = "It seems like the provided time frame was not valid. Try a valid one, like 'next month' or 'next year";
      return res.say(failMsg).shouldEndSession(false);
    }
  };
}

app.intent('HackNoHS',
  hackathonHandlerNoScroll(false)
);

app.intent('HackWithHS',
  hackathonHandlerNoScroll(true)
);

app.intent('AMAZON.NextIntent',
  hackathonHandlerWithScroll(HACK_LIMIT)
);

app.intent('AMAZON.PreviousIntent',
  hackathonHandlerWithScroll(-HACK_LIMIT)
);

module.exports = app;