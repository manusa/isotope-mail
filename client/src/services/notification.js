const GRANTED_PERMISSION = 'granted';
const DENIED_PERMISSION = 'denied';

function requestPermission() {
  // Request only if necessary
  if ([GRANTED_PERMISSION, DENIED_PERMISSION].includes(Notification.permission)) {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

export function notify(message, options) {
  return requestPermission().then(permission => {
    if (permission === GRANTED_PERMISSION) {
      const notification = new Notification(message, {...options, icon: 'assets/images/notification-icon.png'});
      notification.onclick = () => window.focus();
      return notification;
    }
    return null;
  });
}
