import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import mainCss from '../../styles/main.scss';

export const ComposeFabButton = ({t, onClick}) => (
  <button className={`${mainCss['mdc-fab']} ${mainCss['compose-fab-button']}`} onClick={onClick}>
    <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>edit</span>
    <span className={`${mainCss['compose-fab-button__label']}`}>{t('composeButton.compose')}</span>
  </button>
);

ComposeFabButton.propTypes = {
  onClick: PropTypes.func
};

ComposeFabButton.defaultProps = {
  onClick: () => {}
};

export default translate()(ComposeFabButton);
