import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import FolderItem from './folder-item';
import mainCss from '../../styles/main.scss';
import PropTypes from 'prop-types';

class FolderList extends Component {
  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Link className={`${mainCss['mdc-list-item']}`} to='/mui-components'>
          <i className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>inbox</i>
          Inbox
        </Link>
        {this.props.folderList.map((folder, index) => <FolderItem key={index} label={folder.name}></FolderItem>)}
      </nav>
    );
  }
}

FolderList.propTypes = {
  folderList: PropTypes.array.isRequired
};

export default FolderList;
