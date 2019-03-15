import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../buttons/icon-button';
import mainCss from '../../styles/main.scss';

const TopBarButton = ({onClick, children}) => (
  <IconButton
    onClick={onClick}
    className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
    {children}
  </IconButton>
);

TopBarButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default TopBarButton;
