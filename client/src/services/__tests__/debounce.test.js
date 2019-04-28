import debounce from '../debounce';

describe('Debounce service test suite', () => {
  test('debounce, function called several times during period, should only be invoked once', done => {
    // Given
    jest.useFakeTimers();
    const fakeFunction = jest.fn();
    const debouncedFakeFunction = debounce(fakeFunction, 500);

    // When
    debouncedFakeFunction();
    jest.advanceTimersByTime(499);
    debouncedFakeFunction();
    jest.runAllTimers();

    // Then
    expect(fakeFunction).toHaveBeenCalledTimes(1);
    expect(clearTimeout).toHaveBeenCalledTimes(2);
    expect(clearTimeout).toHaveBeenNthCalledWith(1, expect.undefined);
    expect(clearTimeout).toHaveBeenNthCalledWith(2, expect.anything());
    expect(setTimeout).toHaveBeenCalledTimes(2);
    done();
  });
  test('debounce, function called several times during period and once after, should be invoked twice', done => {
    // Given
    jest.useFakeTimers();
    const fakeFunction = jest.fn();
    const debouncedFakeFunction = debounce(fakeFunction, 500);

    // When
    debouncedFakeFunction();
    jest.advanceTimersByTime(499);
    debouncedFakeFunction();
    jest.advanceTimersByTime(501);
    debouncedFakeFunction();
    jest.runAllTimers();

    // Then
    expect(fakeFunction).toHaveBeenCalledTimes(2);
    expect(clearTimeout).toHaveBeenCalledTimes(3);
    expect(clearTimeout).toHaveBeenNthCalledWith(1, expect.undefined);
    expect(clearTimeout).toHaveBeenNthCalledWith(2, expect.anything());
    expect(clearTimeout).toHaveBeenNthCalledWith(3, null);
    expect(setTimeout).toHaveBeenCalledTimes(3);
    done();
  });
  test('debounce, function called several times and cancelled during period , should NOT be invoked', done => {
    // Given
    jest.useFakeTimers();
    const fakeFunction = jest.fn();
    const debouncedFakeFunction = debounce(fakeFunction, 500);

    // When
    debouncedFakeFunction();
    jest.advanceTimersByTime(499);
    debouncedFakeFunction();
    jest.advanceTimersByTime(499);
    debouncedFakeFunction.cancel();
    jest.runAllTimers();

    // Then
    expect(fakeFunction).toHaveBeenCalledTimes(0);
    expect(clearTimeout).toHaveBeenCalledTimes(3);
    expect(clearTimeout).toHaveBeenNthCalledWith(1, expect.undefined);
    expect(clearTimeout).toHaveBeenNthCalledWith(2, expect.anything());
    expect(setTimeout).toHaveBeenCalledTimes(2);
    done();
  });
});
