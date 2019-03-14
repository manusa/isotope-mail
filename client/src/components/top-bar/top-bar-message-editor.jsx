import React from 'react';
import PropTypes from 'prop-types';
import ButtonCollapse from './button-collapse';
import mainCss from '../../styles/main.scss';

const TopBarMessageEditor = (
  {
    collapsed, sideBarToggle, title
  }) => (
  <div className={mainCss['mdc-top-app-bar__row']}>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
      <ButtonCollapse collapsed={collapsed} sideBarToggle={sideBarToggle} />
      <span className={mainCss['mdc-top-app-bar__title']}>{title}</span>
    </section>
  </div>
);

TopBarMessageEditor.propTypes = {
  title: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired
};

export default TopBarMessageEditor;
