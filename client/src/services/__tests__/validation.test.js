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
      const invalidEmail = 'invalid';
      // When
      const result = validateEmail(invalidEmail);
      // Then
      expect(result).not.toBeNull();
      expect(result).not.toHaveLength(0);
    });
    test('valid email, mime formatted, should return null', () => {
      // Given
      const validEmail = '"I\'m Valid" <valid@email.com>';
      // When
      const result = validateEmail(validEmail);
      // Then
      expect(result).toBeNull();
    });
    test('invalid email, mime formatted, should return validation error message', () => {
      // Given
      const invalidEmail = '"I Suck" <invalid>';
      // When
      const result = validateEmail(invalidEmail);
      // Then
      expect(result).not.toBeNull();
      expect(result).not.toHaveLength(0);
    });
    test('empty email, mime formatted, should return validation error message', () => {
      // Given
      const invalidEmail = '"I Suck" <>';
      // When
      const result = validateEmail(invalidEmail);
      // Then
      expect(result).not.toBeNull();
      expect(result).not.toHaveLength(0);
    });
    test('empty email and name, mime formatted, should return validation error message', () => {
      // Given
      const invalidEmail = '<>';
      // When
      const result = validateEmail(invalidEmail);
      // Then
      expect(result).not.toBeNull();
      expect(result).not.toHaveLength(0);
    });
    test('valid email and name with symbols, mime formatted, should return null', () => {
      // Given
      const validEmail = '"<" <valid@email.com>';
      // When
      const result = validateEmail(validEmail);
      // Then
      expect(result).toBeNull();
    });
    test('valid email and name with many symbols, mime formatted, should return null', () => {
      // Given
      const validEmail = '"<><<<>> > < <valid@mail.com>" <valid@email.com>';
      // When
      const result = validateEmail(validEmail);
      // Then
      expect(result).toBeNull();
    });
  });
});
