#!/usr/bin/env node

var fs = require('fs'),
  d3Dsv = require('d3-dsv');

var file = fs.readFileSync(
  './2018-ea-survey-anon-currencied-processed.csv',
  'utf8',
);

var data = d3Dsv.csvParse(file);

['cause_import', 'ea_career'].forEach(prefix => {
  fs.writeFileSync(
    prefix + '.csv',
    d3Dsv.csvFormat(
      data,
      data.columns.filter(column => column.startsWith(prefix)),
    ),
    'utf8',
  );
});

const combinations = new Map([['engagement', ['want_ea_newsletter', 'which_year_EA', 'donate_2017_c']]]);

for (let [key, value] of combinations) {
  fs.writeFileSync(
    key + '.csv',
    d3Dsv.csvFormat(
      data,
      value,
    ),
    'utf8',
  );
}

data.columns.forEach(column => {
  fs.writeFileSync(column + '.csv', d3Dsv.csvFormat(data, [column]), 'utf8');
});
