import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';

export const ButtonForward = ({t, outboxEmpty, forwardMessage}) => (
  outboxEmpty && (
    <span isotip={t('topBar.forward')} isotip-position='bottom' isotip-size='small'>
      <TopBarButton onClick={forwardMessage}>forward</TopBarButton>
    </span>)
);

ButtonForward.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  forwardMessage: PropTypes.func.isRequired
};

export default translate()(ButtonForward);
