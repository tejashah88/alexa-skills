// initialization of the needed modules to run the app
var alexa = require('alexa-utils');

// we use 'process.env.PORT' when deploying it to heroku and '8080' for locally testing the server
const PORT = process.env.PORT || 8080;

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneAnalyzer = new ToneAnalyzerV3({
	username: '<insert-username-here>',
	password: '<insert-password-here>',
	version_date: '2016-05-19 '
});

// a utility function to print JSON objects in a pretty format
var printJSON = function(json) {
	console.log(JSON.stringify(json, null, 4));
}

// a function used for catagorizing the score of the emotion
var emotion_describe = function(score) {
	if (score <= 0.20) { // between 0.00 and 0.20
		return "not much ";
	} else if (score > 0.20 && score <= 0.40) { // between 0.20 and 0.40
		return "a little bit of ";
	} else if (score > 0.40 && score <= 0.60) { // between 0.40 and 0.60
		return "a decent amount of ";
	} else if (score > 0.60 && score <= 0.80) { // between 0.60 and 0.80
		return "quite a bit of ";
	} else if (score > 0.80 && score <= 1.00) { // between 0.80 and 1.00
		return "an overwhelming amount of ";
	}
}

var app = alexa.app("SocialAdviser")
	.onLaunch(function(req, res) {
		res.prompt("Welcome to the Social Adviser. What would you like me to do?")
			.reprompt("What would you like Social Adviser to do?")
			.endSession(false)
			.send();
	})
	.onIntent("CheckPost", function(req, res) {
		var inputText = req.intent.slot("post_text");

		// check if the needed slot is given
		if (!inputText) {
			var prompt = "I'm sorry. I could not hear the post you said. Could you repeat your phrase again?";
			res.prompt(prompt)
				.reprompt(prompt)
				.endSession(false)
				.send();
		} else {
			toneAnalyzer.tone({
				text: inputText,
				sentences: false, // we do not want analysis of the individual sentences
				tones: "emotion"  // we only want the 'emotion' part of the analysis
			},
			function(err, tone) {
				if (err) {
					console.log(err);
					res.prompt("Oh no, an error occurred. The error has been reported to the developer.");
				} else {
					var emotion_tones = tone.document_tone.tone_categories[0].tones;

					// we sort the emotion tones in order to get the top 2 and classify them
					emotion_tones.sort(function(a, b) {
						return a.score - b.score;
					});
					emotion_tones.reverse();

					var firstHighEmotion = emotion_tones[0];
					var secondHighEmotion = emotion_tones[1];

					var prompt = "You seem to mainly have " + emotion_describe(firstHighEmotion.score) + firstHighEmotion.tone_name + ". "
					prompt += "You also seem to have " + emotion_describe(secondHighEmotion.score) + secondHighEmotion.tone_name + ".";

					res.prompt(prompt);
				}

				res.send();
			});
		}
	})
	.onIntent("AMAZON.StopIntent", function(req, res) {
		res.endSession(true).send();
	})
	.onIntent("AMAZON.CancelIntent", function(req, res) {
		res.endSession(true).send();
	})
	.onIntent("AMAZON.HelpIntent", function(req, res) {
		var prompt = "You can ask me review your post by saying, review this post, or, give insight on my post, followed by the post that you want to make. You can also say stop or cancel if you are done.";
		res.prompt(prompt).endSession(false).send();
	})
	.onSessionEnd(function(req, res) {
		res.prompt("Thank you for using the Social Adviser. Goodbye.").send();
	})
	.host("/advice", PORT, false, true);

console.log("Starting server on port " + PORT);