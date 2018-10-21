'use strict';

const { MATCH_CAMEL_CASE } = require('./constants');

// Generates a range of number from start to end (both are inclusive)
const genRange = (start, end) => [...Array(1 + end - start).keys()].map(v => start + v);

// Pretifies the locations from the MLH Hackathon data
function normalizeLocation(location) {
  return location
    .replace(MATCH_CAMEL_CASE, '$1 $2')
    .replace(',', ', ');
}

function filterBeforeFuture(hackathons, futureDate) {
  return hackathons.filter(hack => +new Date(hack.startDate) <= +new Date(futureDate));
}

function speakifyDate(date) {
  return date.replace(/-/g, '');
}

function translateFutureDate(futureDate) {
  let date = new Date(futureDate);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Takes a list returns a subset of it with calculated scrolling
// Geared for handling "next" and "previous" commands against lists of data
function calculateScrollWindow(list, start, end, scroll) {
  // trying to bite more than it can chew
  if (end - start > list.length)
    return [0, list.length];

  if (scroll) {
    start += scroll;
    end += scroll;
  }

  let overspill = end - list.length;
  let underspill = -start;
  if (overspill > 0) {
    start -= overspill;
    end -= overspill;
  }

  if (underspill > 0) {
    start += underspill;
    end += underspill;
  }

  return [start, end];
}

module.exports = {
  genRange,
  normalizeLocation,
  filterBeforeFuture,
  speakifyDate,
  translateFutureDate,
  calculateScrollWindow
};