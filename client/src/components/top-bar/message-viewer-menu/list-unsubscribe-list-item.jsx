import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

const ListUnsubscribeListItem = ({t, message}) => {
  let listItem = null;
  if (message.listUnsubscribe && message.listUnsubscribe.length > 0) {
    const entries = message.listUnsubscribe[0].match(/<([^>]*?)>/);
    if (entries) {
      listItem = (
        <li>
          <a
            className={mainCss['mdc-list-item']}
            href={entries[1]}
            target="_blank" rel="noopener noreferrer"
          >
            <span className={`${mainCss['mdc-list-item__graphic']} material-icons`}>unsubscribe</span>
            {t('topBar.messageViewerMenu.listUnsubscribe')}
          </a>
        </li>
      );
    }
  }
  return listItem;
};

ListUnsubscribeListItem.propTypes = {
  t: PropTypes.func.isRequired,
  message: PropTypes.shape({
    listUnsubscribe: PropTypes.array
  }).isRequired
};

export default ListUnsubscribeListItem;
