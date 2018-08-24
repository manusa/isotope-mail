import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import TopBar from './top-bar/top-bar';
import SideBar from './side-bar/side-bar';
import MessageList from './message-list/message-list';
import {FolderTypes, getFolders} from '../services/folder';
import {addFolder} from '../actions/folders';
import {addMessage} from '../actions/messages';
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
    this.toggleSideBar = this.toggleSideBar.bind(this);
  }

  render() {
    return (
      <div className={styles.app}>
        <TopBar sideBarCollapsed={this.state.sideBar.collapsed} sideBarToggle={this.toggleSideBar}/>
        <SideBar collapsed={this.state.sideBar.collapsed}/>
        <div className={`${mainCss['mdc-top-app-bar--fixed-adjust']} ${styles['message-grid-wrapper']}
          ${this.state.sideBar.collapsed ? '' : styles['with-side-bar']}`}>
          <MessageList className={styles['message-grid']} />
          <div className={styles['fab-container']}>
            <button className={`${mainCss['mdc-fab']}`} onClick={this.props.addMessage.bind(this)}>
              <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>edit</span>
            </button>
            <button className={`${mainCss['mdc-fab']}`} onClick={this.props.addFolder.bind(this)}>
              <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>folder</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    document.title = this.props.application.title;
    this.refreshPoll = setInterval(() => {
      this.props.reloadFolders();
    }, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshPoll);
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

App.propTypes = {
  application: PropTypes.object.isRequired,
  folders: PropTypes.object.isRequired,
  reloadFolders: PropTypes.func,
  addFolder: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  application: state.application,
  folders: state.folders
});

const mapDispatchToProps = dispatch => ({
  reloadFolders: credentials => getFolders(dispatch, credentials, true),
  addFolder: () => {
    dispatch(addFolder({fullURL: 'FU', name: 'New Folder', type: FolderTypes.FOLDER, children: []}));
  },
  addMessage: () => {
    dispatch(addMessage({subject: 'New Message'}));
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  reloadFolders: () => dispatchProps.reloadFolders(stateProps.application.user.credentials)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App);
