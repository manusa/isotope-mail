/**
 * Rounds the given value to the specified decimalPlaces
 *
 * <i>Source http://www.jacklmoore.com/notes/rounding-in-javascript/<i>
 *
 * @param value {number}
 * @param decimalPlaces {number}
 * @returns {number}
 */
function round(value, decimalPlaces) {
  return Number(`${Math.round(Number(`${value}e${decimalPlaces}`))}e-${decimalPlaces}`);
}

/**
 * Returns a pretty string representation of a date relative to the current date.
 *
 * @param date {Date}
 * @returns {string}
 */
export function prettyDate(date) {
  date = new Date(date);
  const currentDate = new Date();
  const truncDate = new Date(date);
  [currentDate, truncDate].forEach(d => d.setHours(0, 0, 0, 0));
  if (currentDate.getTime() === truncDate.getTime()) {
    return date.toLocaleString(navigator.language, {hour: '2-digit', minute: '2-digit'});
  } else if (currentDate.getFullYear() === date.getFullYear()) {
    return date.toLocaleString(navigator.language, {month: 'short', day: '2-digit'});
  }
  return date.toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit'});
}

/**
 * Returns a pretty string representation of a memory size.
 *
 * @param size {number}
 * @returns {string}
 */
export function prettySize(size) {
  const divisor = 1024;
  if (size < Math.pow(divisor, 2)) {
    return `${round(size / divisor, 2)} KiB`;
  } else if (size < Math.pow(divisor, 3)) {
    return `${round(size / Math.pow(divisor, 2), 2)} MiB`;
  }
  return `${round(size / Math.pow(divisor, 3), 2)} GiB`;
}

