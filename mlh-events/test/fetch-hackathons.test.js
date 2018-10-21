'use strict';

const { expect } = require('chai');

const fetchHackathons = require('../src/fetch-hackathons');
const collegiateHackathons = require('./fixtures/only-collegiate-hackathons.json');
const highSchoolHackathons = require('./fixtures/only-high-school-hackathons.json');

describe('event-retriver', function() {
  describe('#fetchHackathons', function() {
    this.timeout(0);
    for (let hsOnly of [true, false]) {
      describe(`testing only ${hsOnly ? 'high school' : 'collegiate'} hackathons`, function() {
        it('should retrieve a non-empty array of hackathons', async function() {
          let hackathons = await fetchHackathons(hsOnly);
          expect(hackathons).to.be.an('array');
          expect(hackathons).to.not.be.empty;
        });

        it('formats a given event to the expected requirements', function() {
          let hackathons = hsOnly ? highSchoolHackathons : collegiateHackathons;
          let firstEvent = hackathons[0];

          let expectedField2Type = {
            name: 'string',
            url: 'string',
            startDate: 'string',
            endDate: 'string',
            location: 'string',
            isHighSchool: 'boolean'
          };

          let expectedFields = Object.keys(expectedField2Type);
          let expectedTypes = Object.values(expectedField2Type);
          expect(firstEvent).to.have.all.keys(expectedFields);

          for (let index in expectedTypes) {
            let key = expectedFields[index];
            let etype = expectedTypes[index];
            expect(firstEvent[key]).to.be.a(etype);
          }
        });
      });
    }
  });
});