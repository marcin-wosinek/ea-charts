#!/usr/bin/env node

var fs = require('fs'),
  d3Dsv = require('d3-dsv');

var file = fs.readFileSync(
  './2018-ea-survey-anon-currencied-processed.csv',
  'utf8',
);

var data = d3Dsv.csvParse(file);

['cause_import'].forEach(prefix => {
  fs.writeFileSync(
    prefix + '.csv',
    d3Dsv.csvFormat(
      data,
      data.columns.filter(column => column.startsWith('cause_import')),
    ),
    'utf8',
  );
});

data.columns.forEach(column => {
  fs.writeFileSync(column + '.csv', d3Dsv.csvFormat(data, [column]), 'utf8');
});
