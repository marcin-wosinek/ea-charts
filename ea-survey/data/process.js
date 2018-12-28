#!/usr/bin/env node

'use strict'

const _ = require('lodash'),
  fs = require('fs'),
  file = fs.readFileSync('./ea-survey/data/2018-ea-survey-anon-currencied-processed.csv', 'utf8'),
  d3Dsv = require('d3-dsv');

const data = d3Dsv.csvParse(file);

const processed = _.map(data, row => {
  const subscribe = row.heard_ea === 'Yes' && row.is_ea1 === 'Yes',
    identifier = subscribe && row.is_ea2 === 'Yes',
    subscriber = subscribe && row.is_ea2 === 'No';

  let type;

  if (identifier) {
    type = 'identifier';
  } else if(subscriber) {
    type = 'subscriber';
  } else {
    type = 'none';
  }

  return {
    country: row.country,
    type
  };
});

fs.writeFileSync(
  'ea-survey/data/sub-id.json',
  JSON.stringify(processed),
  'utf8');
