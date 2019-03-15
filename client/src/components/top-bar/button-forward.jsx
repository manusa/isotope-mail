import React from 'react';
import PropTypes from 'prop-types';
import TopBarButton from './top-bar-button';

const ButtonForward = ({outboxEmpty, forwardMessage}) => (
  outboxEmpty && (
    <TopBarButton onClick={forwardMessage}>forward</TopBarButton>)
);

ButtonForward.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  forwardMessage: PropTypes.func.isRequired
};

export default ButtonForward;
