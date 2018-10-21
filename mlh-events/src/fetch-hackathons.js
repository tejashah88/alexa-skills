'use strict';

const { URL } = require('url');
const axios = require('axios');

const { CURR_YEAR, TODAY } = require('./constants');
const { normalizeLocation } = require('./utils');

// Returns raw list of hackathons from API endpoint and formats the data for further processing
async function fetchHackathons(hsOnly = false) {
  let { data: hackathons } = await axios.get(`https://mlh-events.now.sh/na-${CURR_YEAR}`);
  return hackathons
    .map(event => {
      event.name = event.name.trim();
      // the city and state/country can sometimes be fused together
      event.location = normalizeLocation(event.location);
      event.url = new URL(event.url).hostname;
      delete event.imageUrl;
      return event;
    })
    // don't keep the hackathons that are already done
    .filter(event => +new Date(event.startDate) >= +TODAY)
    // either keep the HS only or collegiate hackathons
    .filter(event => event.isHighSchool === hsOnly);
}

module.exports = fetchHackathons;