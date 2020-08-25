'use strict';

const parseRTF = require('..');
const { readFileSync } = require('fs');

const rtf = readFileSync('./reports/1110779471-20200721.rtf');
parseRTF(rtf).then(rtfdoc => console.log({ rtfdoc }));
