#!/bin/bash

i=0

for collumn in $( head -n 1 2018-ea-survey-anon-currencied-processed.csv  | sed 's/,/ /g' ); do
  i=$((i + 1))
  echo item: $i - $collumn
  cut -d, -f $i-$i 2018-ea-survey-anon-currencied-processed.csv > $collumn.csv
done
