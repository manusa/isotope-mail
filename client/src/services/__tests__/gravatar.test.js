import {imageUrl} from '../gravatar';

describe('gravatar service test suite', () => {
  describe('imageUrl', () => {
    test('e-mail and no options, should return Gravatar URL', () => {
      // Given
      const email = ' maRc@Marcnuri.com    ';
      // When
      const result = imageUrl(email);
      // Then
      expect(result).toBe('https://www.gravatar.com/avatar/db0ae606e556df390f743c73e69ad436');
    });
    test('e-mail and options with default image, should return Gravatar URL', () => {
      // Given
      const email = ' maRc@Marcnuri.com    ';
      // When
      const result = imageUrl(email, {defaultImage: 'retro'});
      // Then
      expect(result).toBe('https://www.gravatar.com/avatar/db0ae606e556df390f743c73e69ad436?d=retro');
    });
  });
});
