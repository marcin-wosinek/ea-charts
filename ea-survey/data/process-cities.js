#!/usr/bin/env node

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  file = fs.readFileSync('./ea-survey/data/Cities combined.csv', 'utf8'),
  d3Dsv = require('d3-dsv'),
  worldCountries = require('world-atlas/world/110m.json'),
  key = fs.readFileSync('/home/marcin/.keys/google.api', 'utf8'),
  stringify = require('json-stable-stringify');

const googleMapsClient = require('@google/maps').createClient({
  key,
  Promise,
});

const data = d3Dsv.csvParse(file),
  counted = _.countBy(data, 'Cities');

fs.writeFileSync(
  'ea-survey/data/world-countries.json',
  stringify(worldCountries, {space: '  '}),
  'utf8',
);

const processed = [];

function translate(city) {
  switch (city) {
    case 'Warsaw':
      return 'Warszawa';
    case 'London (ON)':
      return 'London, Ontario, Canada';
    case 'SF Bay Area':
      return 'San Francisco';
    case 'Oxford':
      return 'Oxford, UK';
    case 'Boston':
      return 'Boston, UK';
    case 'Cambridge (UK)':
      return 'Cambridge, UK';
    case 'Durham':
      return 'Durham, UK';
    case 'Ruhr Valley':
      return 'Ruhr';
    case 'Waterloo':
      return 'Ruhr, Belgium';
    case 'Yorkshire':
      return 'County of York, England';
    case 'Witten':
      return 'Witten, Germany';
  }

  return city;
}

const vague = {};

const promises = _.map(counted, async (value, key) => {
  const city = translate(key);

  if (!city) {
    return;
  }

  const response = await googleMapsClient.geocode({address: city}).asPromise();

  const result = response.json.results[0];

  if (response.json.results.length > 1) {
    vague[city] = response.json.results;
  }

  if (!result || !result.geometry || !result.formatted_address) {
    console.error('failed to understand', city);
  }

  processed.push({
    name: city,
    value: value,
    formatted_address: result.formatted_address,
    location: result.geometry.location,
    longitude: result.geometry.location.lng,
    latitude: result.geometry.location.lat,
  });
});

Promise.all(promises).finally(() => {
  const combined = _.chain(processed)
    .groupBy(city => city.formatted_address)
    .map(cityGroup => {
      return _.reduce(cityGroup, (currentCity, nextCity) => {
        currentCity.value += nextCity.value;
        return currentCity;
      });
    })
    .orderBy(['value', 'formatted_address'])
    .reverse()
    .value();

  fs.writeFileSync(
    'ea-survey/data/all-cities.json',
    stringify(combined, {space: '  '}),
    'utf8',
  );

  console.log(
    `there is ${
      _.toArray(vague).length
    } vague locations (more than 1 match in google api)`,
  );

  fs.writeFileSync(
    'ea-survey/data/vague-cities.json',
    stringify(vague, {space: '  '}),
    'utf8',
  );
});
