import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import TopBar from './top-bar/top-bar';
// import barStyles from '@material/top-app-bar/mdc-top-app-bar.scss'; // If want to use inline styles barStyles['mdc-top-app-bar__row']
import styles from './app.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <TopBar />
        <nav className={styles.drawer}>
          <div className={styles['mdc-drawer__toolbar-spacer']}></div>
          <div className={`${styles['mdc-drawer__content']} ${styles['drawer-content']}`}>
            <nav className={styles['mdc-list']}>
              <Link className={`${styles['mdc-list-item']}`} to='/mui-components'>
                <i className={`material-icons ${styles['mdc-list-item__graphic']}`}>inbox</i>Inbox
              </Link>
            </nav>
          </div>
        </nav>
      </div>
    );
  }
}

export default App;
