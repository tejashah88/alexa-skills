'use strict';

const Speech = require('ssml-builder');
const {
  filterBeforeFuture,
  speakifyDate,
  translateFutureDate
} = require('./utils');

function presentHackathons(hackathons, futureDate, start, end) {
  let finalHacks = filterBeforeFuture(hackathons, futureDate).slice(start, end);
  let speech = new Speech();

  if (finalHacks.length == 0) {
    speech
      .say('No hackathons have been found until')
      .sayAs({
        word: speakifyDate(translateFutureDate(futureDate)),
        interpret: 'date',
        format: 'md'
      });
  } else {
    speech.sentence(`Here's a list of ${finalHacks.length} MLH hackathons:`);

    for (let index in finalHacks) {
      let hack = finalHacks[index];
      speech
        .say(`#${parseInt(index) + 1 + start}`)
        .pause('200ms')
        .say(`${hack.name}, which is located in ${hack.location}, starts on`)
        .sayAs({
          word: speakifyDate(hack.startDate),
          interpret: 'date',
          format: 'md'
        })
        .say(' and ends on ')
        .sayAs({
          word: speakifyDate(hack.endDate),
          interpret: 'date',
          format: 'md'
        })
        .pause('500ms');
    }
  }

  return speech.ssml(true);
}

module.exports = presentHackathons;