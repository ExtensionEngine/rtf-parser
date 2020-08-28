'use strict';

const parseRTF = require('..');
const path = require('path');
const { readFileSync } = require('fs');

const rtf = readFileSync(path.join(__dirname, '../reports/1110779471-20200721.rtf'));
parseRTF(rtf).then(rtfdoc => console.log({ rtfdoc }));
