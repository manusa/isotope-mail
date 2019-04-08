import sanitize from './sanitize';
import {HttpHeaders, isSuccessful} from './fetch';
import {round} from '../services/prettify';
import {
  outboxMessageProcessed,
  outboxSendMessage as sendMessageAction,
  outboxUpdateProgress,
  outboxSetSent,
  outboxSetError
}
  from '../actions/application';
import {getIsotopeConfiguration} from '../selectors/globals';

const SNACKBAR_DURATION = 4000;

export function sendMessage(
  dispatch, credentials, {inReplyTo = [], references = [], to, cc, bcc, attachments = [], subject, content}) {
  const message = {
    recipients: [
      ...to.map(address => ({type: 'To', address: address})),
      ...cc.map(address => ({type: 'Cc', address: address})),
      ...bcc.map(address => ({type: 'Bcc', address: address}))
    ],
    inReplyTo,
    references,
    attachments,
    subject: subject,
    content: sanitize.sanitize(content)
  };
  const postMessageRequest = new XMLHttpRequest();
  postMessageRequest.open('POST', getIsotopeConfiguration()._links.smtp.href);
  postMessageRequest.setRequestHeader(HttpHeaders.ISOTOPE_CREDENTIALS, credentials.encrypted);
  postMessageRequest.setRequestHeader(HttpHeaders.ISOTOPE_SALT, credentials.salt);
  postMessageRequest.setRequestHeader(HttpHeaders.CONTENT_TYPE, `application/json; charset=${document.characterSet}`);
  const upload = postMessageRequest.upload;
  upload.onprogress = e => dispatch(outboxUpdateProgress(round(e.loaded / e.total, 2)));
  const errorHandler = () => {
    dispatch(outboxSetError(true));
  };
  postMessageRequest.onload = event => {
    if (isSuccessful(event.target.status)) {
      dispatch(outboxSetSent(true));
      setTimeout(() => dispatch(outboxMessageProcessed()), SNACKBAR_DURATION);
    } else {
      errorHandler();
    }
  };
  postMessageRequest.onerror = errorHandler;
  dispatch(sendMessageAction(message));
  postMessageRequest.send(JSON.stringify(message));
}
