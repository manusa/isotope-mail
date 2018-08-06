import React, {Component} from 'react';
import TopBar from './top-bar/top-bar';
import SideBar from './side-bar/side-bar';
import mainCss from '../styles/main.scss';
import styles from './app.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sideBar: {
        collapsed: false
      }
    };
  }
  render() {
    return (
      <div className={styles.app}>
        <TopBar sideBarCollapsed={this.state.sideBar.collapsed} sideBarToggle={this.toggleSideBar.bind(this)}/>
        <SideBar collapsed={this.state.sideBar.collapsed} />
        <div className={`${mainCss['mdc-top-app-bar--fixed-adjust']} ${styles['message-grid-wrapper']}`}>
          <div className={styles['message-grid']}>
            <ul className={`${mainCss['mdc-list']}`}>
              <li className={mainCss['mdc-list-item']}>This is a message</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  toggleSideBar() {
    const toggleCollapsed = !this.state.sideBar.collapsed;
    this.setState({
      sideBar: {
        collapsed: toggleCollapsed
      }
    });
  }
}

export default App;
