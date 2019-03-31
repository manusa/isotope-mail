import {getCredentials} from '../application';

describe('application selectors test suite', () => {
  describe('getCredentials', () => {
    test('application.selectedFolderId in folders.explodedFolders, should return folder', () => {
      // Given
      const state = {
        application: {
          user: {
            credentials: {
              authenticated: false,
              encrypted: '1337LEET',
              salt: '3313373',
              name: 'ELITE'
            },
            hash: 'e5e802104a2f161320a3b65d2bf30331b38627642e8e2e78f233933d9df63c27',
            id: '803fd1d3c21a38cebf730c2acf1a0ce400404290199db4a57e1229cf02b24584'
          }
        }
      };
      // When
      const result = getCredentials(state);
      // Then
      expect(result).toEqual({
        authenticated: false,
        encrypted: '1337LEET',
        salt: '3313373',
        name: 'ELITE'
      });
    });
  });
});
