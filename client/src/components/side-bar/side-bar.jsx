import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FolderContainer from '../folders/folder-container';
import mainCss from '../../styles/main.scss';
import styles from './side-bar.scss';


class SideBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <aside className={`${styles['side-bar']}
      ${mainCss['mdc-drawer--persistent']} ${mainCss['mdc-drawer--animating']}
       ${this.getCollapsedClassName()}`}>
        <nav className={`${styles.drawer} ${mainCss['mdc-drawer__drawer']}`}>
          <div className={mainCss['mdc-drawer__toolbar-spacer']}></div>
          <div className={`${mainCss['mdc-drawer__content']} ${styles['drawer-content']}`}>
            <FolderContainer />
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
