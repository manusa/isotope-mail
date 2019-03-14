import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonMarkUnread = ({onClick}) => (
  <button
    onClick={onClick}
    className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
    markunread
  </button>
);

ButtonMarkUnread.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ButtonMarkUnread;
