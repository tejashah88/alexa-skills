const TODAY = new Date();
// used for accounting for MLH season cut-off
// 7 == August
const APPEND_YEAR = TODAY.getMonth() >= 7 ? 1 : 0;
const CURR_YEAR = TODAY.getFullYear() + APPEND_YEAR;

const ERROR_RES = 'Oh no! An error occured while trying to fulfill your request. Please try again later!';
const DEFAULT_RES = 'No problem. Have a nice day!';

const HACK_LIMIT = 5;

const MATCH_CAMEL_CASE = /([a-z])([A-Z])/g;

module.exports = {
  TODAY, CURR_YEAR,
  ERROR_RES, DEFAULT_RES,
  HACK_LIMIT,
  MATCH_CAMEL_CASE
};