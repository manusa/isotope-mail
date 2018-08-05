import React, {Component} from 'react';
import {Link} from 'react-router-dom';
// import barStyles from '@material/top-app-bar/mdc-top-app-bar.scss'; // If want to use inline styles barStyles['mdc-top-app-bar__row']
import styles from './app.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <header className={styles.topAppBar}>
          <div className={styles['mdc-top-app-bar__row']}>
            <section className={`${styles['mdc-top-app-bar__section']} ${styles['mdc-top-app-bar__section--align-start']}`}>
              <a href="#" className={`material-icons ${styles['mdc-top-app-bar__navigation-icon']}`}>menu</a>
              <span className={styles['mdc-top-app-bar__title']}>Title</span>
            </section>
          </div>
        </header>
        <Link to='/mui-components'>With Components</Link>
      </div>
    );
  }
}

export default App;
