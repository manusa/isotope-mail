import sjcl from 'sjcl';

/**
 * Encrypts the provided data using the specified password and posts a message with the result.
 *
 * @param event
 * @param {string} event.data.password - The password to use in the encryption
 * @param {string} event.data.data - The data to encrypt
 */
onmessage = event => {
  postMessage({
    encryptedData: sjcl.encrypt(event.data.password, event.data.data),
    workerHref: self.location.href
  });
};
