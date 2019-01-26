import {unicodeUrlAtob, unicodeUrlBtoa} from '../base64';

describe('base64 service test suite', () => {
  describe('unicodeUrlBtoa function test suite', () => {
    test('ASCII string, should encode OK', () => {
      const result = unicodeUrlBtoa('This is a regular String!:');
      expect(result).toEqual('VGhpcyBpcyBhIHJlZ3VsYXIgU3RyaW5nITo=');
    });
    test('Chinese characters string, should encode OK', () => {
      const result = unicodeUrlBtoa('阿双方的');
      expect(result).toEqual('6Zi_5Y-M5pa555qE');
    });
    test('Mixed chinese characters string, should encode OK', () => {
      const result = unicodeUrlBtoa('原种 - 1337');
      expect(result).toEqual('5Y6f56eNIC0gMTMzNw==');
    });
  });
  describe('unicodeUrlAtob function test suite', () => {
    test('ASCII string, should decode OK', () => {
      const result = unicodeUrlAtob('VGhpcyBpcyBhIHJlZ3VsYXIgU3RyaW5nITo=');
      expect(result).toEqual('This is a regular String!:');
    });
    test('Chinese characters string, should decode OK', () => {
      const result = unicodeUrlAtob('6Zi_5Y-M5pa555qE');
      expect(result).toEqual('阿双方的');
    });
    test('Mixed chinese characters string, should decode OK', () => {
      const result = unicodeUrlAtob('5Y6f56eNIC0gMTMzNw==');
      expect(result).toEqual('原种 - 1337');
    });
  });
});
