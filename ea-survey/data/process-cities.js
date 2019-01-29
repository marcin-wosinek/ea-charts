#!/usr/bin/env node

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  file = fs.readFileSync('./ea-survey/data/Cities combined.csv', 'utf8'),
  d3Dsv = require('d3-dsv'),
  worldCountries = require("world-atlas/world/110m.json");

const data = d3Dsv.csvParse(file),
  counted = _.countBy(data, 'Cities');

fs.writeFileSync(
  'ea-survey/data/world-countries.json',
  JSON.stringify(worldCountries),
  'utf8',
);

return;

_.each(data, row => {
  const countryRaw = row['In what country do you live? Response'];
  let foundCountry = countryJs.ISOcodes(countryRaw, 'name');

  if (!foundCountry) {
    switch (countryRaw) {
      case 'Myanmar': // BU or MM
      case 'Serbia': // RS
        return;
      case 'United Kingdom of Great Britain and Northern Ireland':
        foundCountry = countryJs.ISOcodes('GB');
        break;
      case 'The former Yugoslav Republic of Macedonia':
        foundCountry = countryJs.ISOcodes('MK');
        break;
      default:
        console.warn(countryRaw);
    }
  }

  const country = foundCountry ? foundCountry.alpha2 : countryRaw;

  if (counted[country]) {
    counted[country]++;
  } else {
    counted[country] = 1;
  }
});

const processed = [];

_.each(counted, (value, key) => {
  const country = countryJs.info(key);

  otherCountries.delete(country.name);

  let data = country.geoJSON;

  data.eaCount = value;
  data.country = country.name;
  data.countryAlpha2 = key;
  data.population = country.population;
  data.eaPerMillion = (value * 1000000) / country.population;

  processed.push(data);
});

otherCountries.forEach(name => {
  const country = countryJs.info(name, 'name');

  let data = country.geoJSON;

  data.eaCount = 0;
  data.country = country.name;
  data.countryAlpha2 = country.ISO.alpha2;
  data.population = country.population;
  data.eaPerMillion = 0;

  processed.push(data);
});

fs.writeFileSync(
  'ea-survey/data/all-countries.json',
  JSON.stringify(processed),
  'utf8',
);
