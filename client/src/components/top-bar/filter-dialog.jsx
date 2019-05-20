import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {
  setMessageFilterKey as setMessageFilterKeyAction,
  setMessageFilterText as setMessageFilterTextAction
} from '../../actions/application';
import MessageFilters from '../../services/message-filters';
import styles from './filter-dialog.scss';
import mainCss from '../../styles/main.scss';
import {
  activeMessageFilter as activeMessageFilterSelector,
  messageFilterText as messageFilterTextSelector} from '../../selectors/application';

export const FilterDialog = (
  {
    t, visible, closeFilterDialogHandler,
    activeMessageFilter, setMessageFilterKey,
    messageFilterText, setMessageFilterText
  }) =>
  <div
    className={`${styles['filter-dialog']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
    ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
    aria-hidden={!visible}
  >
    <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
      <li
        className={`${styles['filter-dialog__item-text']} ${messageFilterText ?
          styles['filter-dialog__item-text--active'] : ''} ${mainCss['mdc-list-item']}`}
      >
        <input
          className={styles['text-field']}
          value={messageFilterText}
          onChange={e => setMessageFilterText(e.target.value)}
          onMouseDown={() => {
            closeFilterDialogHandler.disabled = true;
          }}
        />
        <i className={`${styles.icon} material-icons ${mainCss['mdc-button__icon']}`}>search</i>
      </li>
      {Object.entries(MessageFilters).map(([key, value]) => {
        const active = key === activeMessageFilter.key;
        return (
          <li
            key={key}
            className={`${styles['filter-dialog__item-check']} ${mainCss['mdc-list-item']}
          ${active ? mainCss['mdc-list-item--selected'] : ''}`}
            onClick={() => setMessageFilterKey(value)}
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

FilterDialog.propTypes = {
  t: PropTypes.func,
  visible: PropTypes.bool.isRequired,
  closeFilterDialogHandler: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  activeMessageFilter: activeMessageFilterSelector(state),
  messageFilterText: messageFilterTextSelector(state)
});

const mapDispatchToProps = dispatch => ({
  setMessageFilterKey: messageFilter => dispatch(setMessageFilterKeyAction(messageFilter.key)),
  setMessageFilterText: messageFilterText => dispatch(setMessageFilterTextAction(messageFilterText))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(FilterDialog));
