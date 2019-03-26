import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';

export const ButtonCollapse = ({t, collapsed, sideBarToggle}) => (
  collapsed && (
    <span isotip={t('topBar.showSideBar')} isotip-position='bottom-start' isotip-size='small'>
      <TopBarButton onClick={sideBarToggle}>menu</TopBarButton>
    </span>)
);

ButtonCollapse.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired
};

export default translate()(ButtonCollapse);
