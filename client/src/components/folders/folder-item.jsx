import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FolderTypes} from '../../services/folder';
import styles from './folder-item.scss';
import mainCss from '../../styles/main.scss';

class FolderItem extends Component {
  render() {
    return (
      <a className={`${mainCss['mdc-list-item']} ${styles.listItem}
        ${this.props.selected ? mainCss['mdc-list-item--selected'] : ''}`}
      onClick={this.props.onClick}
      onDrop={this.props.onDrop} onDragOver={e => e.preventDefault()}>
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
  selected: PropTypes.bool.isRequired,
  onDrop: PropTypes.func,
  onClick: PropTypes.func,
  unreadMessageCount: PropTypes.number,
  newMessageCount: PropTypes.number
};

FolderItem.defaultProps = {
  graphic: FolderTypes.FOLDER.icon,
  selected: false,
  unreadMessageCount: 0,
  newMessageCount: 0,
  onDrop: null
};

export default FolderItem;
