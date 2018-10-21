'use strict';

const fs = require('fs-extra');
const path = require('path');
const appRoot = require('app-root-path');
const { fetchHackathons } = require('../src/event-retriever');

(async () => {
  let collegiateHackathons = await fetchHackathons(false);
  let collegiatePath = path.join(appRoot.path, 'test/fixtures/only-collegiate-hackathons.json');
  await fs.outputJson(collegiatePath, collegiateHackathons, { spaces: 2 });

  let hsHackathons = await fetchHackathons(true);
  let highSchoolPath = path.join(appRoot.path, 'test/fixtures/only-high-school-hackathons.json');
  await fs.outputJson(highSchoolPath, hsHackathons, { spaces: 2 });
})();