import MessageFilters, {getFromKey} from '../message-filters';

describe('MessageFilters service test suite', () => {
  test('MessageFilters, should return expected structure', () => {
    // Given
    // Default structure class values
    // When
    const messageFilters = MessageFilters;
    // Then
    expect(Object.keys(messageFilters)).toEqual([
      'ALL',
      'READ',
      'UNREAD',
      'FLAGGED'
    ]);
    Object.values(messageFilters).forEach(mf => {
      expect(Object.keys(mf)).toEqual(['key', 'i18nKey', 'selector']);
    });
  });
  describe('getFromKey', () => {
    test('no arguments, should return ALL Message Filter, selector returns unmodified input array', () => {
      // Given
      const messages = [{}];
      // When
      const messageFilter = getFromKey();
      // Then
      expect(messageFilter).toBe(MessageFilters.ALL);
      expect(messageFilter.selector(messages)).toBe(messages);
    });
    test('null key, should return ALL Message Filter, selector returns unmodified input array', () => {
      // Given
      const key = null;
      const messages = [{}];
      // When
      const messageFilter = getFromKey(key);
      // Then
      expect(messageFilter).toBe(MessageFilters.ALL);
      expect(messageFilter.selector(messages)).toBe(messages);
    });
    test('READ key, should return READ Message Filter, selector returns array of messages !seen', () => {
      // Given
      const key = 'READ';
      const messages = [{uid: 1, seen: false}, {uid: 2, seen: true}];
      // When
      const messageFilter = getFromKey(key);
      // Then
      expect(messageFilter).toBe(MessageFilters.READ);
      expect(messageFilter.selector(messages)).toHaveLength(1);
      expect(messageFilter.selector(messages)[0]).toEqual(expect.objectContaining({uid: 2}));
    });
    test('UNREAD key, should return UNREAD Message Filter, selector returns array of messages seen', () => {
      // Given
      const key = 'UNREAD';
      const messages = [{uid: 1, seen: false}, {uid: 2, seen: true}];
      // When
      const messageFilter = getFromKey(key);
      // Then
      expect(messageFilter).toBe(MessageFilters.UNREAD);
      expect(messageFilter.selector(messages)).toHaveLength(1);
      expect(messageFilter.selector(messages)[0]).toEqual(expect.objectContaining({uid: 1}));
    });
    test('FLAGGED key, should return FLAGGED Message Filter, selector returns array of messages flagged', () => {
      // Given
      const key = 'FLAGGED';
      const messages = [{uid: 1, seen: false, flagged: false}, {uid: 2, seen: true}, {uid: 3, flagged: true}];
      // When
      const messageFilter = getFromKey(key);
      // Then
      expect(messageFilter).toBe(MessageFilters.FLAGGED);
      expect(messageFilter.selector(messages)).toHaveLength(1);
      expect(messageFilter.selector(messages)[0]).toEqual(expect.objectContaining({uid: 3}));
    });
  });
});
