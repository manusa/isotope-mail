import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import FolderItem from './folder-item';
import mainCss from '../../styles/main.scss';

const folders = [
  {name: 'First'},
  {name: 'Second'}
];

class FolderList extends Component {
  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Link className={`${mainCss['mdc-list-item']}`} to='/mui-components'>
          <i className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>inbox</i>
          Inbox
        </Link>
        {folders.map((folder, index) => <FolderItem key={index} label={folder.name}></FolderItem>)}
      </nav>
    );
  }
}

export default FolderList;
