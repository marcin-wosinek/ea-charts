#!/usr/bin/env node

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  file = fs.readFileSync('./ea-survey/data/countries list.csv', 'utf8'),
  d3Dsv = require('d3-dsv'),
  countryJs = require('countryjs');

const data = d3Dsv.csvParse(file);

const processed = {};

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

  if (processed[country]) {
    processed[country]++;
  } else {
    processed[country] = 1;
  }
});

fs.writeFileSync(
  'ea-survey/data/all-countries.json',
  JSON.stringify(processed),
  'utf8',
);
