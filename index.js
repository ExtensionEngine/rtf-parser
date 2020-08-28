#!/usr/bin/env node

'use strict';

const pumpify = require('pumpify');
const RTFDocument = require('rtf-parser/rtf-document');
const RTFInterpreter = require('rtf-parser/rtf-interpreter');
const RTFParser = require('rtf-parser/rtf-parser');

module.exports = parseRTF;

/**
 * Parse RTF document
 * @param {Buffer} buffer RTF document
 * @returns {Promise<RTFDocument>} RTF document object
 *
 * @example
 * const parseRTF = require('@extensionengine/rtf-parser');
 * const path = require('path');
 * const { readFileSync } = require('fs');
 *
 * const rtf = readFileSync(path.join(__dirname, './reports/1110779471-20200721.rtf'));
 * parseRTF(rtf).then(rtfdoc => console.log({ rtfdoc }));
 */
function parseRTF(buffer) {
  const input = unicodeEscape(buffer.toString('binary'));
  return new Promise((resolve, reject) => {
    const rtfdoc = new RTFDocument();
    const parser = new RTFParser();
    const interpreter = new RTFInterpreter(rtfdoc);
    const stream = pumpify(parser, interpreter);
    stream.once('error', err => reject(err));
    stream.once('finish', () => resolve(rtfdoc));
    stream.end(input);
  });
}

/**
 * @typedef {Object} RTFDocument
 * @see https://github.com/iarna/rtf-parser#rtfdocument
 */

if (require.main === module) {
  (function () {
    const path = require('path');
    const { promisify } = require('util');
    const { readFileSync, writeFile } = require('fs');

    const writeFileAsync = promisify(writeFile);

    const [sourcePath] = process.argv.slice(2);

    if (!sourcePath) {
      console.error('Error: Source path not provided!');
      process.exit(1);
    }

    const buffer = readFileSync(sourcePath);
    parseRTF(buffer)
      .catch(err => {
        console.error('Error: Failed to parse RTF document:', sourcePath, err.stack);
        process.exit(1);
      })
      .then(rtfdoc => {
        const dirname = path.dirname(sourcePath);
        const filename = path.basename(sourcePath, '.rtf');
        const destPath = path.join(dirname, `${filename}.txt`);
        return writeFileAsync(destPath, getText(rtfdoc)).then(() => destPath);
      })
      .then(filepath => console.log('Text extracted:', filepath));
  }());
}

function unicodeEscape(str) {
  return str.split('').map(char => {
    const charCode = char.charCodeAt(0);
    const isASCII = charCode <= 127;
    return isASCII ? char : `\\'${charCode.toString('16')}`;
  }).join('');
}

function getText(rtfdoc) {
  return rtfdoc.content.map(paragraph => {
    return paragraph.content.map(span => span.value).join('');
  }).join('\n');
}
