import editorButtons from '../editor-buttons';

describe('Editor buttons constants test suite', () => {
  test('Number of buttons should be 16', () => {
    // Given
    const editorButtonsKeys = Object.keys(editorButtons);

    // When
    const editorButtonsCount = editorButtonsKeys.length;

    // Then
    expect(editorButtonsCount).toEqual(16);
  });
  test('All buttons have activeFunction and toggleFunction', () => {
    // Given
    const editorButtonValues = Object.values(editorButtons);

    // When
    editorButtonValues.forEach(button => {
      // Then
      expect(button.activeFunction).not.toBeNull();
      expect(button.activeFunction instanceof Function).toEqual(true);
      expect(button.toggleFunction).not.toBeNull();
      expect(button.toggleFunction instanceof Function).toEqual(true);
    });
  });
});
