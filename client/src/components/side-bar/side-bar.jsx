import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import FolderContainer from '../folders/folder-container';
import mainCss from '../../styles/main.scss';
import styles from './side-bar.scss';


class SideBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const t = this.props.t;
    return (
      <aside className={`${styles['side-bar']}
          ${mainCss['mdc-drawer']}
          ${mainCss['mdc-drawer--dismissible']}
          ${this.getCollapsedClassName()}`}>
        <div className={`${mainCss['mdc-drawer__header']} ${styles['top-container']}`}>
          {(location.protocol !== 'https:' ?
            <span className='material-icons' isotip={t('sideBar.errors.noSSL')}
              isotip-position='bottom-start' isotip-size='small'>
            lock_open
            </span> : null)}
          {(this.props.errors.diskQuotaExceeded ?
            <span className='material-icons' isotip={t('sideBar.errors.diskQuotaExceeded')}
              isotip-position='bottom-start' isotip-size='small'>
            disc_full
            </span> : null)}
          <button onClick={this.props.sideBarToggle}
            className={`material-icons ${mainCss['mdc-icon-button']} ${styles.toggle}`}>
            keyboard_arrow_left
          </button>
        </div>
        <div className={`${mainCss['mdc-drawer__content']} ${styles['drawer-content']}`}>
          <FolderContainer />
        </div>
      </aside>
    );
  }

  getCollapsedClassName() {
    return this.props.collapsed ? '' : `${styles.open} ${mainCss['mdc-drawer--open']}`;
  }
}

SideBar.propTypes = {
  t: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  errors: state.application.errors
});

export default connect(mapStateToProps)(translate()(SideBar));
