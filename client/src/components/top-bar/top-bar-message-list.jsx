import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import ButtonCollapse from './button-collapse';
import TopBarButton from './top-bar-button';
import ButtonFilter from './button-filter';
import mainCss from '../../styles/main.scss';

export const TopBarMessageList = (
  {
    t, collapsed, sideBarToggle, title,
    selectedMessages, onDeleteClick,
    selectedMessagesAllUnread, onMarkReadClick, onMarkUnreadClick
  }) => (
  <div className={mainCss['mdc-top-app-bar__row']}>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
      <ButtonCollapse collapsed={collapsed} sideBarToggle={sideBarToggle} />
      <span className={mainCss['mdc-top-app-bar__title']}>{title}</span>
    </section>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}`}>
      {selectedMessages.length > 0 &&
        <Fragment>
          <span isotip={t('topBar.delete')} isotip-position='bottom' isotip-size='small'>
            <TopBarButton onClick={onDeleteClick}>delete</TopBarButton>
          </span>
          {selectedMessages.length > 0 && selectedMessagesAllUnread ?
            <span isotip={t('topBar.markRead')} isotip-position='bottom' isotip-size='small'>
              <TopBarButton onClick={onMarkReadClick}>drafts</TopBarButton>
            </span> :
            <span isotip={t('topBar.markUnread')} isotip-position='bottom' isotip-size='small'>
              <TopBarButton onClick={onMarkUnreadClick}>markunread</TopBarButton>
            </span>
          }
        </Fragment>
      }
      <ButtonFilter/>
    </section>
  </div>
);

TopBarMessageList.propTypes = {
  title: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  selectedMessages: PropTypes.array.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  selectedMessagesAllUnread: PropTypes.bool.isRequired,
  onMarkReadClick: PropTypes.func.isRequired,
  onMarkUnreadClick: PropTypes.func.isRequired
};

export default translate()(TopBarMessageList);
