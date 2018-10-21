"use strict";

const alexa = require("alexa-app");
let app = new alexa.app("drip-calculator");

const ENABLE_SLOT_FILLING = { dialog: { type: "delegate" } };

function calcDripStuff({ homes, faucets, dripsPerMinute }) {
  let dripsPerDay = 1440 * dripsPerMinute * faucets * homes;
  let litersPerDay = dripsPerDay / 4000;
  let gallonsPerDay = litersPerDay / 3.785;
  let gallonsPerYear =  gallonsPerDay * 365;
  let baths = gallonsPerYear / 30;

  return { dripsPerDay, litersPerDay, gallonsPerDay, gallonsPerYear, baths };
}

function round2Tenths(number) {
  return Math.round(number * 10) / 10;
}

app.post = function(req, res, type, error) {
  if (error) {
    console.log(error);
    return res.clear().say("An error occured: " + error).send();
  }
};

app.error = (error, req, res) => {
  console.log(error);
  return res.clear().say("An error occured: " + error).send();
};

app.launch((req, res) => {
  let initialOutput = "This skill is for calculating how much water can be potentially wasted from a leaking faucet.";
  let repromptOutput = "Just ask me 'How much water can a faucet leak?' or 'Find out how much water can a faucet leak?'";
  res.say(initialOutput + " " + repromptOutput).reprompt(repromptOutput).shouldEndSession(false);
});

app.intent("AMAZON.HelpIntent", (req, res) => {
  let initialHelpOutput = "This skill is for calculating how much water can be potentially wasted from a leaking faucet.";
  let helpOutput = [
    "You can ask, 'how much water can a faucet leak?' or 'How much water does a leaking faucet waste?'",
    "You can also say stop or exit to quit."
  ].join(" ");
  res.say(initialHelpOutput + " " + helpOutput).reprompt(helpOutput).shouldEndSession(false);
});

let defaultHaltHandler = (req, res) => res.say("No problem. Have a nice day!");
app.intent("AMAZON.StopIntent", defaultHaltHandler);
app.intent("AMAZON.CancelIntent", defaultHaltHandler);

app.intent("CalculateDrip", ENABLE_SLOT_FILLING, (req, res) => {
  const isInvalidValue = val => val === "?" || parseInt(val) <= 0;

  if (isInvalidValue(req.slot("homes")))
    return res.say("You must specify a valid amount of homes.").shouldEndSession(true);
  else if (isInvalidValue(req.slot("faucets")))
    return res.say("You must specify a valid amount of faucets.").shouldEndSession(true);
  else if (isInvalidValue(req.slot("dripsPerMinute")))
    return res.say("You must specify a valid amount of drips per minute.").shouldEndSession(true);

  let homes = parseInt(req.slot("homes"));
  let faucets = parseInt(req.slot("faucets"));
  let dripsPerMinute = parseInt(req.slot("dripsPerMinute"));

  let {
    dripsPerDay, gallonsPerDay,
    gallonsPerYear, baths
  } = calcDripStuff({ homes, faucets, dripsPerMinute });

  let output = [
    `Given the ${homes} homes, ${faucets} faucets per home, and ${dripsPerMinute} drips per minute for each faucet, here's what I discovered.`,
    `On a daily basis, ${round2Tenths(dripsPerDay)} drips would go wasted, which is about ${round2Tenths(gallonsPerDay)} gallons per day.`,
    `In a year, ${round2Tenths(gallonsPerYear)} gallons per year would go down the drain, which is the equivalent of ${Math.round(baths)} baths per year.`
  ].join(" ");

  res.say(output).shouldEndSession(true);
});

exports.handler = app.lambda();