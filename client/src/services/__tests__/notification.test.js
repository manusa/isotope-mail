import {notify, notifyNewMail} from '../notification';

describe('Notification service test suite', () => {
  const expectNoNotification = async result => {
    expect(global.Notification).toHaveBeenCalledTimes(0);
    expect(result).toEqual(null);
  };
  test('notify, requests permission but not granted, should do nothing', done => {
    // Given
    global.Notification = jest.fn();
    global.Notification.permission = 'default';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('denied'));

    // When
    notify('I\'m a loser baby').then(expectNoNotification).then(() => done());

    // Then
    expect(global.Notification.requestPermission).toHaveBeenCalledTimes(1);
  });
  test('notify, already denied permission, should do nothing', done => {
    // Given
    global.Notification = jest.fn();
    global.Notification.permission = 'denied';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('denied'));

    // When
    notify('I\'m a loser baby').then(expectNoNotification).then(() => done());

    // Then
    expect(global.Notification.requestPermission).toHaveBeenCalledTimes(0);
  });
  test('notify, requests permission and granted, should notify', done => {
    // Given
    global.Notification = jest.fn();
    global.Notification.permission = 'default';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));

    // When
    notify('I\'m a loser baby').then(result => {
      expect(global.Notification).toHaveBeenCalledTimes(1);
      expect(result).not.toEqual(null);
      done();
    });

    // Then
    expect(global.Notification.requestPermission).toHaveBeenCalledTimes(1);
  });
  test('notifyNewMail, requests permission and granted, should notify', done => {
    // Given
    global.Notification = jest.fn(message => {
      expect(message).toEqual('notifications.newMail');
    });
    global.Notification.permission = 'default';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));

    // When
    notifyNewMail().then(result => {
      expect(global.Notification).toHaveBeenCalledTimes(1);
      expect(result).not.toEqual(null);
      done();
    });

    // Then
    expect(global.Notification.requestPermission).toHaveBeenCalledTimes(1);
  });
});
