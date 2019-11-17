import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {addressGroups} from './message-viewer';
import styles from './header-to.scss';


class HeaderTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };
  }

  render() {
    const className = this.props.className;
    return this.state.collapsed ?
      this._renderCollapsed(className) : this._renderExpanded(className);
  }

  _renderCollapsed(className = '') {
    const t = this.props.t;
    const to = this.props.recipients.map(eachTo => addressGroups(eachTo.address));
    return (
      <div className={`${className} ${styles.to} ${styles.collapsed}`}>
        <label>{t('messageViewer.to')}: </label>
        <span className={styles.collapsedList}>
          {to.map((eachTo, i) => (
            <span key={i} className={styles.entry}>
              <span className={styles.name}>{eachTo.name}</span>
              <span className={styles.email}>{eachTo.email ? `<${eachTo.email}>` : ''}</span>
            </span>
          ))}
        </span>
        <span className={`material-icons ${styles.expand}`}
          onClick={() => this.toggleCollapsed()}>
          expand_more
        </span>
      </div>
    );
  }

  _renderExpanded(className = '') {
    const t = this.props.t;
    const recipients = this.props.recipients;
    const to = recipients.filter(r => r.type === 'To');
    const cc = recipients.filter(r => r.type === 'Cc');
    const bcc = recipients.filter(r => r.type === 'Bcc');
    return (
      <div className={`${className} ${styles.to} ${styles.expanded}`}>
        <span className={styles.recipientGroupContainer}>
          {to.length > 0 ?
            <span className={`${styles.recipientGroup}`}>
              <label>{t('messageViewer.to')}: </label>
              {this._renderExpandedEntries(to)}
            </span> :
            null
          }
          {cc.length > 0 ?
            <span className={`${styles.recipientGroup}`}>
              <label>{t('messageViewer.cc')}: </label>
              {this._renderExpandedEntries(cc)}
            </span> :
            null
          }
          {bcc.length > 0 ?
            <span className={`${styles.recipientGroup}`}>
              <label>{t('messageViewer.bcc')}: </label>
              {this._renderExpandedEntries(bcc)}
            </span> :
            null
          }
        </span>
        <span className={`material-icons ${styles.collapse}`}
          onClick={() => this.toggleCollapsed()}>
          expand_less
        </span>
      </div>
    );
  }

  _renderExpandedEntries(entries) {
    const expandedEntries = entries.map(entry => addressGroups(entry.address));
    return (
      <span className={styles.expandedEntries}>
        {this._renderEntries(expandedEntries)}
      </span>);
  }

  _renderEntries(entries) {
    return entries.map((entry, i) => (
      <span key={i} className={styles.entry}>
        <span className={styles.name}>{entry.name}</span>
        <span className={styles.email}>{entry.email ? `<${entry.email}>` : ''}</span>
      </span>));
  }

  toggleCollapsed() {
    this.setState({collapsed: !this.state.collapsed});
  }
}

HeaderTo.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
  recipients: PropTypes.array.isRequired
};

export default (translate()(HeaderTo));
