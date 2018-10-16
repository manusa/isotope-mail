import sanitize from './sanitize';
import {credentialsHeaders} from './fetch';
import {URLS} from './url';

export function sendMessage(credentials, {inReplyTo = [], references = [], to, cc, bcc, subject, content}) {
  const message = {
    recipients: [
      ...to.map(address => ({type: 'To', address: address})),
      ...cc.map(address => ({type: 'Cc', address: address})),
      ...bcc.map(address => ({type: 'Bcc', address: address}))
    ],
    inReplyTo,
    references,
    subject: subject,
    content: sanitize.sanitize(content)
  };

  return fetch(URLS.SMTP, {
    method: 'POST',
    headers: credentialsHeaders(credentials, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(message)
  });
}
