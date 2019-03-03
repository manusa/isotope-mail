import {validateEmail} from '../validation';

describe('Validation service test suite', () => {
  describe('validateEmail', () => {
    test('valid email, should return null', () => {
      // Given
      const validEmail = 'valid@email.com';
      // When
      const result = validateEmail(validEmail);
      // Then
      expect(result).toBeNull();
    });
    test('invalid email, should return validation error message', () => {
      // Given
      const validEmail = 'invalid';
      // When
      const result = validateEmail(validEmail);
      // Then
      expect(result).not.toBeNull();
      expect(result).not.toHaveLength(0);
    });
  });
});
