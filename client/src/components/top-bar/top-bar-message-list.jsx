import React from 'react';
import PropTypes from 'prop-types';
import ButtonCollapse from './button-collapse';
import ButtonDelete from './button-delete';
import ButtonMarkRead from './button-mark-read';
import ButtonMarkUnread from './button-mark-unread';
import mainCss from '../../styles/main.scss';

const TopBarMessageList = (
  {
    collapsed, sideBarToggle, title,
    onDeleteClick,
    selectedMessagesAllUnread, onMarkReadClick, onMarkUnreadClick
  }) => (
  <div className={mainCss['mdc-top-app-bar__row']}>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
      <ButtonCollapse collapsed={collapsed} sideBarToggle={sideBarToggle} />
      <span className={mainCss['mdc-top-app-bar__title']}>{title}</span>
    </section>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}`}>
      <ButtonDelete onClick={onDeleteClick}/>
      {selectedMessagesAllUnread ?
        <ButtonMarkRead onClick={onMarkReadClick} /> :
        <ButtonMarkUnread onClick={onMarkUnreadClick} />
      }
    </section>
  </div>
);

TopBarMessageList.propTypes = {
  title: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  selectedMessagesAllUnread: PropTypes.bool.isRequired,
  onMarkReadClick: PropTypes.func.isRequired,
  onMarkUnreadClick: PropTypes.func.isRequired
};

export default TopBarMessageList;
