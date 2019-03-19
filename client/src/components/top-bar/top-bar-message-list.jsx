import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import ButtonCollapse from './button-collapse';
import TopBarButton from './top-bar-button';
import ButtonFilter from './button-filter';
import mainCss from '../../styles/main.scss';

const TopBarMessageList = (
  {
    collapsed, sideBarToggle, title,
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
          <TopBarButton onClick={onDeleteClick}>delete</TopBarButton>
          {selectedMessages.length > 0 && selectedMessagesAllUnread ?
            <TopBarButton onClick={onMarkReadClick}>drafts</TopBarButton> :
            <TopBarButton onClick={onMarkUnreadClick}>markunread</TopBarButton>
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

export default TopBarMessageList;
