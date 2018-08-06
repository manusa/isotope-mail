import React, {Component} from 'react';
import FolderItem from './folder-item';
import mainCss from '../../styles/main.scss';

const folders = [
  {id: 1, linkText: 'First'},
  {id: 2, linkText: 'Second'}
];

class FolderList extends Component {
  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        {folders.map(folder => <FolderItem key={folder.id} linkText={folder.linkText}></FolderItem>)}
      </nav>
    );
  }
}

export default FolderList;
