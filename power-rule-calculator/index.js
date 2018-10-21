"use strict";

const alexa = require("alexa-app");
let app = new alexa.app("power-rule-calculator");

function errorHandler(error, res) {
  if (error) {
    console.log(error);
    return res
      .clear()
      .say('Oh no! An error occured while trying to fulfill your request. Please try again later!')
      .send();
  }
}

const defaultHaltHandler = (req, res) => res.say('No problem. Have a nice day!');

app.post = (req, res, type, error) => errorHandler(error, res);
app.error = (error, req, res) => errorHandler(error, res);

app.launch((req, res) => {
  let initialOutput = "This skill is for calculating the derivative or integral of x to the nth power.";
  let repromptOutput = "Just ask me 'What is the derivative of x to the 4th power' or 'What is the integral of x to the 3rd power'";
  res.say(initialOutput + " " + repromptOutput).reprompt(repromptOutput).shouldEndSession(false);
});

app.intent("AMAZON.HelpIntent", (req, res) => {
  let initialHelpOutput = "This skill is for calculating the derivative or integral of x to the nth power.";
  let helpOutput = [
    "Just ask me 'What is the derivative of x to the 4th power' or 'What is the integral of x to the 3rd power'",
    "You can also say stop or exit to quit."
  ].join(" ");
  res.say(initialHelpOutput + " " + helpOutput).reprompt(helpOutput).shouldEndSession(false);
});

app.intent("AMAZON.StopIntent", defaultHaltHandler);
app.intent("AMAZON.CancelIntent", defaultHaltHandler);
app.intent('AMAZON.FallbackIntent', (req, res) => errorHandler('Unable to handle given intent!', res));

app.intent("DerivativePowerRule", (req, res) => {
  let exponent = parseInt(req.slot("exponent"));
  let output = `The derivative of x to the ${exponent} power is ${exponent} times x to the ${exponent - 1} power.`;
  res.say(output).shouldEndSession(true);
});

app.intent("IntegralPowerRule", (req, res) => {
  let exponent = parseInt(req.slot("exponent"));
  let output = `The integral of x to the ${exponent} power is x to the ${exponent + 1} power divided by ${exponent + 1} plus C.`;
  res.say(output).shouldEndSession(true);
});

exports.handler = app.lambda();