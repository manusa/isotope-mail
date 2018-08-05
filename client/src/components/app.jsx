import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import mdcList from '@material/list/mdc-list.scss';
import FolderList from './folders/folder-list';
import TopBar from './top-bar/top-bar';
import styles from './app.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <TopBar />
        <nav className={styles.drawer}>
          <div className={styles['mdc-drawer__toolbar-spacer']}></div>
          <div className={`${styles['mdc-drawer__content']} ${styles['drawer-content']}`}>
            <nav className={mdcList['mdc-list']}>
              <Link className={`${mdcList['mdc-list-item']}`} to='/mui-components'>
                <i className={`material-icons ${mdcList['mdc-list-item__graphic']}`}>inbox</i>
                Inbox
              </Link>
            </nav>
            <FolderList></FolderList>
          </div>
        </nav>
      </div>
    );
  }
}

export default App;
