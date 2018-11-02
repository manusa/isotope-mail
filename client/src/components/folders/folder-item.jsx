import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FolderTypes} from '../../services/folder';
import styles from './folder-item.scss';
import mainCss from '../../styles/main.scss';

class FolderItem extends Component {
  render() {
    const {selected, graphic, label, newMessageCount, unreadMessageCount, onClick, onDrop, onRename} = this.props;
    return (
      <a className={`${mainCss['mdc-list-item']} ${styles.listItem}
        ${selected ? mainCss['mdc-list-item--selected'] : ''}`}
      onClick={onClick}
      onDrop={onDrop} onDragOver={e => e.preventDefault()}>
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.graphic}`}>
          {graphic}
        </span>
        <span className={`${mainCss['mdc-list-item__primary-text']} ${styles.primaryText}
          ${newMessageCount > 0 ? styles.hasNewMessages : ''}`}>
          {`${label} ${unreadMessageCount > 0 ? `(${unreadMessageCount})` : ''}`}
        </span>
        <span className={styles.actions}>
          {
            !onRename ? null :
              <i className={'material-icons'} onClick={onRename}>edit</i>
          }
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
  onRename: PropTypes.func,
  unreadMessageCount: PropTypes.number,
  newMessageCount: PropTypes.number
};

FolderItem.defaultProps = {
  graphic: FolderTypes.FOLDER.icon,
  selected: false,
  unreadMessageCount: 0,
  newMessageCount: 0,
  onDrop: null,
  onRename: null
};

export default FolderItem;
