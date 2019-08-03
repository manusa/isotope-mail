import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import ButtonCollapse from './button-collapse';
import ButtonForward from './button-forward';
import ButtonMore from './button-more';
import ButtonReplyAll from './button-reply-all';
import {MessageViewerMenu} from './message-viewer-menu';
import TopBarButton from './top-bar-button';
import mainCss from '../../styles/main.scss';

export const TopBarMessageViewer = (
  {
    t, collapsed, sideBarToggle, clearSelectedMessage,
    outboxEmpty, onReplyAllMessageClick, onForwardMessageClick,
    onDeleteClick,
    onMarkUnreadClick
  }) => (
  <div className={mainCss['mdc-top-app-bar__row']}>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
      <ButtonCollapse collapsed={collapsed} sideBarToggle={sideBarToggle} />
      <span isotip={t('topBar.backToList')} isotip-position='bottom-start' isotip-size='small'>
        <TopBarButton
          className={`${mainCss['mdc-top-app-bar__navigation-icon']}`}
          onClick={clearSelectedMessage}>
          arrow_back
        </TopBarButton>
      </span>
    </section>
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}`}>
      <ButtonReplyAll outboxEmpty={outboxEmpty} replyAllMessage={onReplyAllMessageClick}/>
      <ButtonForward outboxEmpty={outboxEmpty} forwardMessage={onForwardMessageClick}/>
      <span isotip={t('topBar.delete')} isotip-position='bottom' isotip-size='small'>
        <TopBarButton onClick={onDeleteClick}>delete</TopBarButton>
      </span>
      <span isotip={t('topBar.markUnread')} isotip-position='bottom-end' isotip-size='small'>
        <TopBarButton onClick={onMarkUnreadClick}>markunread</TopBarButton>
      </span>
      <ButtonMore><MessageViewerMenu /></ButtonMore>
    </section>
  </div>
);

TopBarMessageViewer.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  clearSelectedMessage: PropTypes.func.isRequired,
  outboxEmpty: PropTypes.bool.isRequired,
  onReplyAllMessageClick: PropTypes.func.isRequired,
  onForwardMessageClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onMarkUnreadClick: PropTypes.func.isRequired
};

export default translate()(TopBarMessageViewer);
