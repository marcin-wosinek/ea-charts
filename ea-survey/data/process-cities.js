#!/usr/bin/env node

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  file = fs.readFileSync('./ea-survey/data/Cities combined.csv', 'utf8'),
  d3Dsv = require('d3-dsv'),
  worldCountries = require('world-atlas/world/110m.json'),
  key = fs.readFileSync('/home/marcin/.keys/google.api', 'utf8');

const googleMapsClient = require('@google/maps').createClient({
  key,
  Promise,
});

const data = d3Dsv.csvParse(file),
  counted = _.countBy(data, 'Cities');

fs.writeFileSync(
  'ea-survey/data/world-countries.json',
  JSON.stringify(worldCountries),
  'utf8',
);

const processed = [];

let count = 0;

const promises = _.map(counted, async (value, key) => {
  const response = await googleMapsClient.geocode({address: key}).asPromise();

  const result = response.json.results[0];

  if (!result || !result.geometry) {
    console.error('failed to understand', key);
  }

  processed.push({
    name: key,
    value: value,
    formatted_address: result.formatted_address,
    location: result.geometry.location
  });
});

Promise.all(promises).finally(() => {
  fs.writeFileSync(
    'ea-survey/data/all-cities.json',
    JSON.stringify(processed),
    'utf8',
  );
});
