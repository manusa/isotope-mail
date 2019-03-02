/**
 * Validates an email using native HTML5 form component validation.
 *
 * @param email address to validate
 * @returns {*} null if email is valid or validation error message if it isn't
 */
export function validateEmail(email) {
  const fakeEmailComponent = document.createElement('input');
  fakeEmailComponent.setAttribute('type', 'email');
  fakeEmailComponent.value = email;
  return fakeEmailComponent.reportValidity() ? null : fakeEmailComponent.validationMessage;
}
