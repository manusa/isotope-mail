import React, {Component} from 'react';
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
       ${this.getCollapsedClassName()}`}>
        <nav className={`${mainCss['mdc-drawer__drawer']}`}>
          <div className={mainCss['mdc-drawer__toolbar-spacer']}></div>
          <div className={`${mainCss['mdc-drawer__content']} ${styles['drawer-content']}`}>
            <FolderList></FolderList>
          </div>
        </nav>
      </aside>
    );
  }

  getCollapsedClassName() {
    return this.props.collapsed ? '' :
      `${styles.open} ${mainCss['mdc-drawer--open']}`;
  }
}


SideBar.propTypes = {
  collapsed: PropTypes.bool.isRequired
};

export default SideBar;
