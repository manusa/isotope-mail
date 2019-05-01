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
  test('isotope-demo@outlook.com, should return fe6d34682f1391c5680e4b10aa73a2e2', () => {
    // Given
    const text = 'isotope-demo@outlook.com';
    // When
    const result = md5(text);
    // Expect
    expect(result).toEqual('fe6d34682f1391c5680e4b10aa73a2e2');
  });
  test('Time traveling is just too dangerous. Better that I devote myself to study the other great mystery of the universe: women!, should return 8196d59eb3e5a0d0828f330ae78503ca', () => {
    // Given
    const text = 'Time traveling is just too dangerous. Better that I devote myself to study the other great mystery of the universe: women!';
    // When
    const result = md5(text);
    // Expect
    expect(result).toEqual('8196d59eb3e5a0d0828f330ae78503ca');
  });
});
