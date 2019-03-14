import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonMarkRead = ({onClick}) => (
  <button
    onClick={onClick}
    className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
    drafts
  </button>
);

ButtonMarkRead.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ButtonMarkRead;
