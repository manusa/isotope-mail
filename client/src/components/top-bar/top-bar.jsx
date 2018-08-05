import React, {Component} from 'react';
import styles from './top-bar.scss';

class TopBar extends Component {
  render() {
    return (
      <header className={styles.topBar}>
        <div className={styles['mdc-top-app-bar__row']}>
          <section className={`${styles['mdc-top-app-bar__section']} ${styles['mdc-top-app-bar__section--align-start']}`}>
            <a href="#" className={`material-icons ${styles['mdc-top-app-bar__navigation-icon']}`}>menu</a>
            <span className={styles['mdc-top-app-bar__title']}>Title</span>
          </section>
        </div>
      </header>
    );
  }
}

export default TopBar;
