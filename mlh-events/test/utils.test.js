'use strict';

const { expect } = require('chai');

const moment = require('moment');

const utils = require('../src/utils');
const collegiateHackathons = require('./fixtures/only-collegiate-hackathons.json');

describe('utils', () => {
  describe('#genRange', () => {
    it('generates a range of numbers from 0 to 5', () => {
      let range = utils.genRange(0, 5);
      let expectedRange = [0, 1, 2, 3, 4, 5];
      expect(range).to.deep.equal(expectedRange);
    });

    it('generates a range of numbers from -10 to 0', () => {
      let range = utils.genRange(-10, 0);
      let expectedRange = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0];
      expect(range).to.deep.equal(expectedRange);
    });
  });

  describe('#normalizeLocation', () => {
    it('spaces out the commas between the city and state/country', function() {
      let inputLocations = [
        'Toronto,ON',
        'Monterrey,MX',
        'Philadelphia,PA'
      ];

      let expectedResults = [
        'Toronto, ON',
        'Monterrey, MX',
        'Philadelphia, PA',
      ];

      let outputLocations = inputLocations.map(utils.normalizeLocation);
      expect(outputLocations).to.deep.equal(expectedResults);
    });

    it('de-camel-cases any joined words as part of a city', function() {
      let inputLocations = [
        'NewYork',
        'MexicoCity',
        'SaltLakeCity',
      ];

      let expectedResults = [
        'New York',
        'Mexico City',
        'Salt Lake City',
      ];

      let outputLocations = inputLocations.map(utils.normalizeLocation);
      expect(outputLocations).to.deep.equal(expectedResults);
    });

    it('can perform both tasks without interfering with each other', () => {
      let inputLocations = [
        'NewYork,NY',
        'MexicoCity,MX',
        'SaltLakeCity,UT',
      ];

      let expectedResults = [
        'New York, NY',
        'Mexico City, MX',
        'Salt Lake City, UT',
      ];

      let outputLocations = inputLocations.map(utils.normalizeLocation);
      expect(outputLocations).to.deep.equal(expectedResults);
    });
  });

  describe('#filterBeforeFuture', function () {
    it('should only keep hackathons until 4 months from now', function () {
      let futureDate = moment().add(4, 'months').format('MM-DD-YYYY');
      let filteredHackathons = utils.filterBeforeFuture(collegiateHackathons, futureDate);
      let startDates = filteredHackathons.map(event => event.startDate);

      let futureEpoch = +new Date(futureDate);
      for (let startDate of startDates) {
        let startEpoch = +new Date(startDate);
        expect(startEpoch).to.be.below(futureEpoch);
      }
    });
  });

  describe('#speakifyDate', function () {
    it('takes a normal date and preps it for Alexa', function () {
      let inputDates = [
        '05-20-2018',
        '08-17-2018',
        '06-19-2018',
        '09-18-2018',
        '07-31-2018'
      ];

      let expectedResults = [
        '05202018',
        '08172018',
        '06192018',
        '09182018',
        '07312018'
      ];

      let outputDates = inputDates.map(utils.speakifyDate);
      expect(outputDates).to.deep.equal(expectedResults);
    });
  });

  describe('#calculateScrollWindow', () => {
    describe('normal usage', function () {
      it('retrieves a range of 5 numbers with a sliding window from [0, 5] to [5, 10]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = 0, end = 5;
        let scrollValues = [0, 1, 2, 3, 4, 5];

        let expectedResults = [
          [0, 5],
          [1, 6],
          [2, 7],
          [3, 8],
          [4, 9],
          [5, 10]
        ];

        for (let index in scrollValues) {
          let scroll = scrollValues[index];
          let window = utils.calculateScrollWindow(list, start, end, scroll);
          expect(window).to.deep.equal(expectedResults[index]);
        }
      });
    });

    describe('out of bounds for start value', function () {
      it('tries to retrieve 5 numbers with a fixed window of [-3, 2]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = -3, end = 2, scroll = 0;
        let expectedResult = [0, 5];

        let window = utils.calculateScrollWindow(list, start, end, scroll);
        expect(window).to.deep.equal(expectedResult);
      });
    });

    describe('underspilling with scrolling', function () {
      it('tries to retrieve 5 numbers with a sliding window from [-5, 0] to [0, 5]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = 0, end = 5;
        let scrollValues = [-5, -4, -3, -2, -1, 0];
        let expectedResult = [0, 5];

        for (let index in scrollValues) {
          let scroll = scrollValues[index];
          let window = utils.calculateScrollWindow(list, start, end, scroll);
          expect(window).to.deep.equal(expectedResult);
        }
      });
    });

    describe('out of bounds for end value', function () {
      it('tries to retrieve 5 numbers with a fixed window of [8, 13]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = 8, end = 13, scroll = 0;
        let expectedResult = [5, 10];

        let window = utils.calculateScrollWindow(list, start, end, scroll);
        expect(window).to.deep.equal(expectedResult);
      });
    });

    describe('overspilling with scrolling', function () {
      it('tries to retrieve 5 numbers with a sliding window from [5, 10] to [10, 15]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = 0, end = 5;
        let scrollValues = [5, 6, 7, 8, 9, 10];
        let expectedResult = [5, 10];

        for (let index in scrollValues) {
          let scroll = scrollValues[index];
          let window = utils.calculateScrollWindow(list, start, end, scroll);
          expect(window).to.deep.equal(expectedResult);
        }
      });
    });

    describe('out of bounds for both start and end values', function () {
      it('tries to retrieve 15 numbers with a fixed window of [-2, 13]', () => {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let start = -2, end = 13, scroll = 0;
        let expectedResult = [0, 10];

        let window = utils.calculateScrollWindow(list, start, end, scroll);
        expect(window).to.deep.equal(expectedResult);
      });
    });
  });
});