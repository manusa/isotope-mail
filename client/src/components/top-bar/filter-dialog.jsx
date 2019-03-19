import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMessageFilterKey} from '../../actions/application';
import MessageFilters, {getFromKey} from '../../services/message-filters';
import styles from './filter-dialog.scss';
import mainCss from '../../styles/main.scss';

export const FilterDialog = ({t, visible, activeMessageFilter, setMessageFilter}) =>
  <div
    className={`${styles['filter-dialog']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
    ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
    aria-hidden={!visible}
  >
    <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
      {Object.entries(MessageFilters).map(([key, value]) => {
        const active = key === activeMessageFilter.key;
        return (
          <li
            key={key}
            className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}
          ${active ? mainCss['mdc-list-item--selected'] : ''}`}
            onClick={() => setMessageFilter(value)}
          >
            <i className={`${styles.check} ${active ? styles['check--active'] : ''} material-icons`}>
              check
            </i>
            {t(value.i18nKey)}
          </li>
        );
      })}
    </ul>
  </div>;

const mapStateToProps = state => ({
  activeMessageFilter: getFromKey(state.application.messageFilterKey)
});

const mapDispatchToProps = dispatch => ({
  setMessageFilter: messageFilter => dispatch(setMessageFilterKey(messageFilter.key))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(FilterDialog));
