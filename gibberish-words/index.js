var Chance = require('chance'),
    chance = new Chance();
var alexa = require('alexa-app');
var app = new alexa.app("gibberish-words");

app.post = function(req, res, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    console.log(exception);
    return response.clear().say("An error occured: " + exception).send();
  }
};

app.error = (exception, req, res) => {
  console.log(exception);
  return response.clear().say("An error occured: " + exception).send();
};

app.launch((req, res) => {
  var launchOutput = "Hello, I now have the ability to say gibberish phrases for you. What would you like to do?";
  var reprompt = "What would you like to do?"
  response
    .say(launchOutput)
    .reprompt(reprompt)
    .shouldEndSession(false);
});

app.intent("AMAZON.HelpIntent",
  function(req, res) {
    var helpOutput = "You can say 'make a gibberish word' or 'create a funny sentence'. You can also say stop or exit to quit.";
    var reprompt = "What would you like to do?";
    response
      .say(helpOutput)
      .reprompt(reprompt)
      .shouldEndSession(false);
});

app.intent("AMAZON.StopIntent",
  (req, res) => {
    response.say("No problem. Request stopped.");
});

app.intent("AMAZON.CancelIntent",
  (req, res) => {
    response.say("No problem. Request cancelled.");
});

app.intent("WackySpeechIntent",
  {
    "dialog": {
      type: "delegate",
    }
  },
  (req, res) => {
    var speech_type = request.slot("speech_type");
    if (speech_type && chance[speech_type])
      response.say(chance[speech_type]());
    else
      response.say("I'm sorry, but the requested type of speech you requested does not exist!");
  }
);

// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();