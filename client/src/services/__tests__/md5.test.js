import md5 from '../md5';

describe('md5 service test suite', () => {
  describe('md5', () => {
    test('marc@marcnuri.com, should return db0ae606e556df390f743c73e69ad436', () => {
      // Given
      const text = 'marc@marcnuri.com';
      // When
      const result = md5(text);
      // Expect
      expect(result).toEqual('db0ae606e556df390f743c73e69ad436');
    });
  });
});
