import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonCollapse = ({collapsed, sideBarToggle}) => (
  collapsed && (
    <button onClick={sideBarToggle}
      className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
        menu
    </button>)
);

ButtonCollapse.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired
};

export default ButtonCollapse;
