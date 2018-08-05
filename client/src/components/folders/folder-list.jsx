import React, {Component} from 'react';
import mdcList from '@material/list/mdc-list.scss';
import FolderItem from './folder-item';

const folders = [
  {id: 1, linkText: 'First'},
  {id: 2, linkText: 'Second'}
];

class FolderList extends Component {

  render() {
    return (
      <nav className={`${mdcList['mdc-list']}`}>
        {folders.map(folder => <FolderItem key={folder.id} linkText={folder.linkText}></FolderItem>)}
      </nav>
    );
  }
}

export default FolderList;
