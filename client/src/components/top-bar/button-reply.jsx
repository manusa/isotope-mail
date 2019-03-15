import React from 'react';
import PropTypes from 'prop-types';
import TopBarButton from './top-bar-button';

const ButtonReply = ({outboxEmpty, replyMessage}) => (
  outboxEmpty && (
    <TopBarButton onClick={replyMessage}>reply_all</TopBarButton>)
);

ButtonReply.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  replyMessage: PropTypes.func.isRequired
};

export default ButtonReply;
