import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import TopBar from './top-bar/top-bar';
import SideBar from './side-bar/side-bar';
import MessageList from './message-list/message-list';
import MessageViewer from './message-viewer/message-viewer';
import {FolderTypes, getFolders} from '../services/folder';
import {addFolder} from '../actions/folders';
import {addMessage} from '../actions/messages';
import mainCss from '../styles/main.scss';
import styles from './app.scss';
import {resetFolderMessagesCache} from '../services/message';

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
        <SideBar collapsed={this.state.sideBar.collapsed} sideBarToggle={this.toggleSideBar}/>
        <div className={`${mainCss['mdc-top-app-bar--fixed-adjust']} ${styles['content-wrapper']}
            ${this.state.sideBar.collapsed ? '' : styles['with-side-bar']}`}>
          {!this.props.application.selectedMessage || Object.keys(this.props.application.selectedMessage).length === 0 ?
            <Fragment>
              <MessageList className={styles['message-grid']} />
              <div className={styles['fab-container']}>
                <button className={`${mainCss['mdc-fab']}`} onClick={this.props.addMessage.bind(this)}>
                  <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>edit</span>
                </button>
                <button className={`${mainCss['mdc-fab']}`} onClick={this.props.addFolder.bind(this)}>
                  <span className={`material-icons ${mainCss['mdc-fab__icon']}`}>folder</span>
                </button>
              </div>
            </Fragment>
            :
            <MessageViewer className={styles['message-viewer']} />
          }
        </div>
      </div>
    );
  }

  componentDidMount() {
    document.title = this.props.application.title;
    this.startPoll();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.startPoll();
  }

  componentWillUnmount() {
    clearTimeout(this.refreshPollTimeout);
  }

  startPoll() {
    // Start polling when everything is ready
    if (this.props.application.selectedFolderId && Object.keys(this.props.folders.explodedItems).length > 0
      && !this.pollStarted) {
      this.pollStarted = true;
      this.refreshPoll();
    }
  }

  /**
   * Poll function that will refresh the folder list and the INBOX folder.
   *
   * @returns {Promise<void>}
   */
  async refreshPoll() {
    try {
      const folderPromise = this.props.reloadFolders();
      const selectedFolder = this.props.folders.explodedItems[this.props.application.selectedFolderId] || {};
      const messagePromise = this.props.reloadMessageCache(selectedFolder);
      await Promise.all([folderPromise, messagePromise]);
    } catch (e) {
      console.log(`Error in refresh poll: ${e}`);
    }
    this.refreshPollTimeout = setTimeout(this.refreshPoll.bind(this), this.props.application.pollInterval);
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
  reloadMessageCache: PropTypes.func,
  addFolder: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  application: state.application,
  folders: state.folders
});

const mapDispatchToProps = dispatch => ({
  reloadFolders: credentials => getFolders(dispatch, credentials, true),
  reloadMessageCache: (credentials, folder) => resetFolderMessagesCache(dispatch, credentials, folder),
  addFolder: () => {
    dispatch(addFolder({fullURL: 'FU', name: 'New Folder', type: FolderTypes.FOLDER, children: []}));
  },
  addMessage: () => {
    dispatch(addMessage({subject: 'New Message'}));
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  reloadFolders: () => dispatchProps.reloadFolders(stateProps.application.user.credentials),
  reloadMessageCache: folder => dispatchProps.reloadMessageCache(stateProps.application.user.credentials, folder)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App);
