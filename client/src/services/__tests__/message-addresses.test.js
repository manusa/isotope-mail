import {getAddresses} from '../message-addresses';

function arrayToMessageCacheMap(arrayOfMessages) {
  return new Map(arrayOfMessages.map(m => [m.uid, m]));
}
const MESSAGE_CACHE_DUPLICATE_ENTIRES = {
  'cache entry 1': arrayToMessageCacheMap([
    {uid: '1', from: 'email1@email.com', recipients: [{type: 'To', address: '"Mr. Pink" <mrpink@email.com>'}]}
  ]),
  'cache entry 2': arrayToMessageCacheMap([
    {uid: '2', from: 'isotope@isotope', recipients: [{type: 'Cc', address: '"Mr. Pink" <mrpink@email.com>'}]},
    {uid: '3', from: 'isotope@isotope', recipients: [{type: 'To', address: '"Mr. Red" <mrred@email.com>'}]},
    {uid: '4', from: 'isotope@isotope', recipients: [
      {type: 'To', address: '"Mr. Red" <mrred@email.com>'},
      {type: 'Cc', address: 'mrpink@email.com'}
    ]}
  ])
};


describe('MessageAddresses service test suite', () => {
  beforeEach(() => {
    // Add support for flatMap in all node versions
    const concat = (a, b) => a.concat(b);
    const flatMap = (flatFunc, array) => array.map(flatFunc).reduce(concat, []);
    Array.prototype.flatMap = function(flatFunc) {// eslint-disable-line no-extend-native
      return flatMap(flatFunc, this);
    };
  });
  describe('getAddresses', () => {
    test('Message cache with multiple duplicate entries and empty filter value, should return a sorted list of addresses', () => {
      // Given
      const messageCache = MESSAGE_CACHE_DUPLICATE_ENTIRES;

      // When
      const result = getAddresses('', messageCache);

      // Then
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual('isotope@isotope');
      expect(result).toContain('email1@email.com');
      expect(result).toContain('"Mr. Pink" <mrpink@email.com>');
      expect(result).toContain('"Mr. Red" <mrred@email.com>');
      expect(result).toContain('mrpink@email.com');
    });
    test('Message cache with multiple duplicate entries and "Mr. email .com" filter value, should return a sorted filtered list of addresses', () => {
      // Given
      const messageCache = MESSAGE_CACHE_DUPLICATE_ENTIRES;

      // When
      const result = getAddresses('Mr. email .com', messageCache);

      // Then
      expect(result).toHaveLength(2);
      expect(result).toContain('"Mr. Pink" <mrpink@email.com>');
      expect(result).toContain('"Mr. Red" <mrred@email.com>');
    });
  });
});
