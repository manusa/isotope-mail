
function getAllAddresses(messageCaches) {
  return Object.values(messageCaches)
    .flatMap(mc => Array.from(mc.values()))
    .flatMap(m => Array.concat(m.from, m.recipients.map(r => r.address)));
}

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
  const lowerCaseValue = value.toLowerCase();
  return Object.entries(getAllAddressesCounted(messageCaches))
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])
    .filter(address => address.toLowerCase().indexOf(lowerCaseValue) !== -1)
    .slice(0, 10);
}
