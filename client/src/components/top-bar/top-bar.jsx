import React, {Component} from 'react';
import mainCss from '../../styles/main.scss';
import styles from './top-bar.scss';
import PropTypes from 'prop-types';

class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className={`${styles.topBar} ${this.props.sideBarCollapsed ? '' : styles['with-side-bar']}
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']}`}>
        <div className={mainCss['mdc-top-app-bar__row']}>
          <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
            <button onClick={this.props.sideBarToggle} className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>menu</button>
            <span className={mainCss['mdc-top-app-bar__title']}>Title</span>
          </section>
        </div>
      </header>
    );
  }
}

TopBar.propTypes = {
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired
};

export default TopBar;
