import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonReply = ({outboxEmpty, replyMessage}) => (
  outboxEmpty && (
    <button
      onClick={replyMessage}
      className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
      reply_all
    </button>)
);

ButtonReply.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  replyMessage: PropTypes.func.isRequired
};

export default ButtonReply;
