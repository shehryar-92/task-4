'use strict';

/**
 * Pure logic for the World Clock / Timezone Converter.
 * No DOM access here — everything takes plain inputs and returns plain values,
 * so it can be unit tested directly with node:test.
 */

/**
 * Returns the list of all IANA timezone names supported by this environment.
 * e.g. ['Africa/Abidjan', 'Africa/Accra', ..., 'Asia/Karachi', ...]
 */
function getSupportedTimezones() {
  return Intl.supportedValuesOf('timeZone');
}

/**
 * Detects the user's local IANA timezone name (e.g. "Asia/Karachi"),
 * based on their system/browser settings.
 */
function detectLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Checks whether a given string is a valid, supported IANA timezone name.
 * Useful for validating search input before adding a city.
 */
function isValidTimezone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.trim() === '') {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a given Date object as a time string (e.g. "3:45:12 PM")
 * in the given IANA timezone.
 */
function formatTimeInZone(date, timeZone, options = {}) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options,
  });
  return formatter.format(date);
}

/**
 * Formats a given Date object as a date string (e.g. "Sat, Jul 18")
 * in the given IANA timezone. Useful for showing when a city is
 * a day ahead/behind the user's local date.
 */
function formatDateInZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return formatter.format(date);
}

/**
 * Returns a short, human-friendly label for a timezone, e.g.
 * "Asia/Karachi" -> "Karachi". Falls back to the raw name if the
 * format is unexpected (e.g. "UTC").
 */
function getShortCityName(timeZone) {
  const parts = timeZone.split('/');
  const last = parts[parts.length - 1];
  return last.replace(/_/g, ' ');
}

const helpers = {
  getSupportedTimezones,
  detectLocalTimezone,
  isValidTimezone,
  formatTimeInZone,
  formatDateInZone,
  getShortCityName,
};

// Node (for node:test) uses module.exports; the browser just gets a global.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = helpers;
} else {
  window.helpers = helpers;
}

