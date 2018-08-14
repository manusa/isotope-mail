import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './folder-item.scss';
import mainCss from '../../styles/main.scss';
import Spinner from '../spinner/spinner';

class FolderItem extends Component {
  render() {
    return (
      <a className={`${mainCss['mdc-list-item']} ${styles.listItem}`}
        onClick={this.props.onClick}>
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.graphic}`}>
          {this.props.graphic}
        </span>
        <span className={`${mainCss['mdc-list-item__primary-text']} ${styles.primaryText}
          ${this.props.newMessageCount > 0 ? styles.hasNewMessages : ''}`}>
          {this.props.label}
          {this.props.unreadMessageCount > 0 ? ` (${this.props.unreadMessageCount})` : ''}
        </span>
      </a>
    );
  }
}

FolderItem.propTypes = {
  graphic: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  unreadMessageCount: PropTypes.number,
  newMessageCount: PropTypes.number
};

Spinner.defaultProps = {
  graphic: 'folder',
  unreadMessageCount: 0,
  newMessageCount: 0
};

export default FolderItem;
