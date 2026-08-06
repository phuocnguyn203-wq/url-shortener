import { expect, test } from 'vitest';

import {
  encodeBase62,
  decodeBase62,
} from "../../src/app/services/shortener.service.js";

test('encodes 0 as the first alphabet character', () => {
  expect(encodeBase62(0)).toBe('0');
});

test('encodes the largest single-digit value (61)', () => {
  expect(encodeBase62(61)).toBe('Z');
});

test('encodes the smallest value that needs two digits (62)', () => {
  expect(encodeBase62(62)).toBe('10');
});

test('encodes an arbitrary large number', () => {
  expect(encodeBase62(238328)).toBe('1000');
});

test('round-trips encode -> decode back to the original number', () => {
  const values = [0, 1, 61, 62, 999, 238328, 999999];

  for (const value of values) {
    expect(decodeBase62(encodeBase62(value))).toBe(value);
  }
});

test('decoding a code with characters outside the alphabet does not throw', () => {
  expect(() => decodeBase62('!!!')).not.toThrow();
});

/* Nothing to test other functions in shortener service
they are just simple, call other functions that will be tested
as unit test. They will be tested in integration test 
*/
