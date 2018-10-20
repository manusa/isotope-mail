import application from '../application';

test('Application default state', () => {
  const applicationDefaultState = application();
  expect(applicationDefaultState).toHaveProperty('title', 'Isotope Mail Clienta');
  expect(applicationDefaultState).toHaveProperty('user', {});
  expect(applicationDefaultState).toHaveProperty('newMessage', null);
  expect(applicationDefaultState).toHaveProperty('selectedFolderId', {});
  expect(applicationDefaultState).toHaveProperty('selectedMessage', null);
  expect(applicationDefaultState).toHaveProperty('pollInterval');
  expect(applicationDefaultState).toHaveProperty('errors.diskQuotaExceeded', false);
  expect(applicationDefaultState).toHaveProperty('activeRequests', 0);
});
