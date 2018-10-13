const rp = require('request-promise-native');

const USAGE_STATS_URL = "https://developer.android.com/about/dashboards/index.html";

const SUPPORTED_CODENAMES = [
  "Oreo", "Nougat", "Marshmallow", "Lollipop",
  "KitKat", "Jelly Bean", "Ice Cream Sandwich",
  "Honeycomb", "Gingerbread", "Froyo", "Eclair",
  "Donut", "Cupcake"
];

// copied shamelessly from string.js
String.prototype.between = function between(left, right) {
  let startPos = this.indexOf(left);
  let endPos = this.indexOf(right, startPos + left.length);
  if (endPos == -1 && right != null)
    return "";
  else if (endPos == -1 && right == null)
    return this.substring(startPos + left.length)
  else
    return this.slice(startPos + left.length, endPos);
}

function getUsageStats(callback) {
  return rp(USAGE_STATS_URL).then(body => {
    if (body.indexOf("VERSION_DATA") != -1) {
      let rawText = body.between("VERSION_DATA", "VERSION_NAMES").between("[", "];");

      if (!rawText)
        throw new Error("Unable to retrieve usage data!");
      else {
        let json = JSON.parse(rawText).data;
        return json;
      }
    }
  })
}

function getUsageByCodename(codename) {
  return getUsageStats().then(data => {
    let validApis = data.filter(version => version.name === codename);
    let usageStat = validApis.reduce((sum, curr) => sum + parseFloat(curr.perc), 0);
    return usageStat;
  })
}

const alexa = require("alexa-app");
const app = new alexa.app("android-usage");

const ENABLE_SLOT_FILLING = { dialog: { type: "delegate" } };

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
  let launchOutput = "I can tell you the usage statistics of any android OS, given the corresponding code name. What would you like to know about?"
  res.say("Hello, " + launchOutput).reprompt(launchOutput).shouldEndSession(false);
});

app.intent("AMAZON.HelpIntent", (req, res) => {
  let helpOutput = "You can query for android usage statistics by code name. For example, you can say, 'what's the ratio of phones that use android lollipop' or 'what percentage of android devices use oreo'. You can also say stop or exit to quit.";
  res.say(helpOutput).reprompt(helpOutput).shouldEndSession(false);
});

let defaultHaltHandler = (req, res) => res.say("No problem. Have a nice day!");
app.intent("AMAZON.StopIntent", defaultHaltHandler);
app.intent("AMAZON.CancelIntent", defaultHaltHandler);

app.intent("QueryByCodename", ENABLE_SLOT_FILLING, (req, res) => {
  let slotRes = req.slots["codename"].resolution(0);
  if (slotRes.status === 'ER_SUCCESS_MATCH') {
    let codename = slotRes.first().name;
    if (codename && SUPPORTED_CODENAMES.includes(codename)) {
      return getUsageByCodename(codename)
        .then(data => res.say(`About ${data}% of all Android devices use Android ${codename}`))
        .catch(err => res.say("It seems like there's a problem with retrieving the usage statistics. Please try again later."));
    } else {
      return res.say("Sorry, but you must specify a valid code name to retrieve usage statistics about.");
    }
  } else {
    return res.say("Sorry, but you must specify a valid code name to retrieve usage statistics about.");
  }
});

exports.handler = app.lambda();