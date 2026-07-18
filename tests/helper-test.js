'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  getSupportedTimezones,
  detectLocalTimezone,
  isValidTimezone,
  formatTimeInZone,
  formatDateInZone,
  getShortCityName,
} = require('./helpers');

test('getSupportedTimezones returns a non-empty array including known zones', () => {
  const zones = getSupportedTimezones();
  assert.ok(Array.isArray(zones));
  assert.ok(zones.length > 100);
  assert.ok(zones.includes('Asia/Karachi'));
  assert.ok(zones.includes('America/New_York'));
});

test('detectLocalTimezone returns a valid IANA timezone string', () => {
  const zone = detectLocalTimezone();
  assert.equal(typeof zone, 'string');
  assert.ok(zone.length > 0);
  assert.ok(isValidTimezone(zone));
});

test('isValidTimezone accepts known IANA names', () => {
  assert.equal(isValidTimezone('Asia/Karachi'), true);
  assert.equal(isValidTimezone('America/New_York'), true);
  assert.equal(isValidTimezone('UTC'), true);
});

test('isValidTimezone rejects garbage input', () => {
  assert.equal(isValidTimezone('Not/A/Real/Zone'), false);
  assert.equal(isValidTimezone(''), false);
  assert.equal(isValidTimezone('   '), false);
  assert.equal(isValidTimezone(null), false);
  assert.equal(isValidTimezone(undefined), false);
  assert.equal(isValidTimezone(123), false);
});

test('formatTimeInZone produces different times for different zones on the same instant', () => {
  // A fixed instant so the test is deterministic.
  const date = new Date('2026-07-18T12:00:00Z');
  const karachi = formatTimeInZone(date, 'Asia/Karachi');
  const newYork = formatTimeInZone(date, 'America/New_York');
  assert.equal(typeof karachi, 'string');
  assert.equal(typeof newYork, 'string');
  assert.notEqual(karachi, newYork);
});

test('formatTimeInZone is deterministic for a fixed instant and zone', () => {
  const date = new Date('2026-07-18T12:00:00Z');
  // Karachi is UTC+5, no DST.
  const result = formatTimeInZone(date, 'Asia/Karachi');
  assert.equal(result, '5:00:00 PM');
});

test('formatTimeInZone handles a DST transition correctly (America/New_York)', () => {
  // Just before US DST starts in 2026 (Mar 8, 2:00 AM local -> 3:00 AM).
  const beforeDst = new Date('2026-03-08T06:59:00Z'); // 1:59 AM EST
  const afterDst = new Date('2026-03-08T07:01:00Z'); // 3:01 AM EDT
  const before = formatTimeInZone(beforeDst, 'America/New_York');
  const after = formatTimeInZone(afterDst, 'America/New_York');
  assert.equal(before, '1:59:00 AM');
  assert.equal(after, '3:01:00 AM');
});

test('formatDateInZone returns a short weekday/month/day string', () => {
  const date = new Date('2026-07-18T12:00:00Z');
  const result = formatDateInZone(date, 'Asia/Karachi');
  assert.equal(typeof result, 'string');
  assert.match(result, /^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}$/);
});

test('formatDateInZone can show a different date than UTC when zone crosses midnight', () => {
  // 11:30 PM UTC on July 18 is already July 19 in Karachi (UTC+5).
  const date = new Date('2026-07-18T23:30:00Z');
  const utcDate = formatDateInZone(date, 'UTC');
  const karachiDate = formatDateInZone(date, 'Asia/Karachi');
  assert.notEqual(utcDate, karachiDate);
});

test('getShortCityName extracts the city from a full IANA name', () => {
  assert.equal(getShortCityName('Asia/Karachi'), 'Karachi');
  assert.equal(getShortCityName('America/New_York'), 'New York');
  assert.equal(getShortCityName('Europe/London'), 'London');
});

test('getShortCityName falls back gracefully for a name with no slash', () => {
  assert.equal(getShortCityName('UTC'), 'UTC');
});

