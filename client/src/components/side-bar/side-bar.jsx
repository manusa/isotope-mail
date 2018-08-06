import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import FolderList from '../folders/folder-list';
import mainCss from '../../styles/main.scss';
import styles from './side-bar.scss';


class SideBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <aside className={`${styles['side-bar']} ${styles.drawer}
      ${mainCss['mdc-drawer--persistent']} ${mainCss['mdc-drawer--animating']}
       ${this.props.collapsed ? '' : mainCss['mdc-drawer--open']}`}>
        <nav className={`${mainCss['mdc-drawer__drawer']}`}>
          <div className={mainCss['mdc-drawer__toolbar-spacer']}></div>
          <div className={`${mainCss['mdc-drawer__content']} ${styles['drawer-content']}`}>
            <nav className={mainCss['mdc-list']}>
              <Link className={`${mainCss['mdc-list-item']}`} to='/mui-components'>
                <i className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>inbox</i>
                Inbox
              </Link>
            </nav>
            <FolderList></FolderList>
          </div>
        </nav>
      </aside>
    );
  }
}

SideBar.propTypes = {
  collapsed: PropTypes.bool.isRequired
};

export default SideBar;
