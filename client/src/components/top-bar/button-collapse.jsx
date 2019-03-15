import React from 'react';
import PropTypes from 'prop-types';
import TopBarButton from './top-bar-button';

const ButtonCollapse = ({collapsed, sideBarToggle}) => (
  collapsed && (
    <TopBarButton onClick={sideBarToggle}>menu </TopBarButton>)
);

ButtonCollapse.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired
};

export default ButtonCollapse;
