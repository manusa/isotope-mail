/**
 * Returns an array containing <b>all</b> of the addresses contained in the provided messageCaches.
 *
 * @param messageCaches
 * @returns {any[]}
 */
function getAllAddresses(messageCaches) {
  return Object.values(messageCaches)
    .flatMap(mc => Array.from(mc.values()))
    .flatMap(m => Array.concat(m.from, m.recipients.map(r => r.address)));
}

/**
 * Returns an object with e-mail addresses as keys and count of these addresses as values for the provided messageCaches
 *
 * @param messageCaches
 */
function getAllAddressesCounted(messageCaches) {
  const counts = {};
  getAllAddresses(messageCaches).forEach(a => {
    if (a in counts) {
      counts[a]++;
    } else {
      counts[a] = 1;
    }
  });
  return counts;
}

export function getAddresses(value, messageCaches) {
  const lowerCaseValues = value.toLowerCase().split(' ');
  return Object.entries(getAllAddressesCounted(messageCaches))
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])
    .filter(address =>
      lowerCaseValues.every(lcv => address.toLowerCase().indexOf(lcv) !== -1))
    .slice(0, 10);
}
