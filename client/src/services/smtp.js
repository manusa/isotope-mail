import sanitize from './sanitize';
import {HttpHeaders} from './fetch';
import {URLS} from './url';
import {round} from '../services/prettify';
import {messageSent, sendMessage as sendMessageAction, sendMessageUpdateProgress} from '../actions/application';

export function sendMessage(dispatch, credentials, {inReplyTo = [], references = [], to, cc, bcc, subject, content}) {
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
  const postMessageRequest = new XMLHttpRequest();
  postMessageRequest.open('POST', URLS.SMTP);
  postMessageRequest.setRequestHeader(HttpHeaders.ISOTOPE_CREDENTIALS, credentials.encrypted);
  postMessageRequest.setRequestHeader(HttpHeaders.ISOTOPE_SALT, credentials.salt);
  postMessageRequest.setRequestHeader(HttpHeaders.CONTENT_TYPE, 'application/json');
  const upload = postMessageRequest.upload;
  upload.onprogress = e => dispatch(sendMessageUpdateProgress(round(e.loaded / e.total, 2)));
  postMessageRequest.onload = () => dispatch(messageSent());
  postMessageRequest.onerror = e => console.error('MESSAGE NOT SENT' + e); // TODO: Add error handling
  dispatch(sendMessageAction(message));
  postMessageRequest.send(JSON.stringify(message));
}
