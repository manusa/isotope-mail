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
      },
      folders: [
        {name: 'First'},
        {name: 'Second'}
      ],
      messages: [
        {subject: 'This is a message'},
        {subject: 'This is another message'}
      ]
    };
  }
  render() {
    return (
      <div className={styles.app}>
        <TopBar sideBarCollapsed={this.state.sideBar.collapsed} sideBarToggle={this.toggleSideBar.bind(this)}/>
        <SideBar collapsed={this.state.sideBar.collapsed} folderList={this.state.folders} />
        <div className={`${mainCss['mdc-top-app-bar--fixed-adjust']} ${styles['message-grid-wrapper']}`}>
          <div className={styles['message-grid']}>
            <ul className={`${mainCss['mdc-list']}`}>
              {this.state.messages.map((message, key) =>
                <li className={mainCss['mdc-list-item']} key={key}>{message.subject}</li>)}
            </ul>
          </div>
          <div className={styles['fab-container']}>
            <button className={`${mainCss['mdc-fab']}`} onClick={this.addMessage.bind(this)}>
              <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>edit</span>
            </button>
            <button className={`${mainCss['mdc-fab']}`} onClick={this.addFolder.bind(this)}>
              <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>folder</span>
            </button>
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

  addFolder() {
    const folders = this.state.folders;
    folders.push({name: `Folder ${folders.length + 1}`});
    this.setState({
      folders: folders
    });
  }

  addMessage() {
    const messages = this.state.messages;
    messages.push({subject: `Message ${messages.length + 1}`});
    this.setState({
      messages: messages
    });
  }
}

export default App;
