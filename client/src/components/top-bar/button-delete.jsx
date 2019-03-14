import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonDelete = ({onClick}) => (
  <button
    onClick={onClick}
    className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
    delete
  </button>
);

ButtonDelete.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ButtonDelete;
