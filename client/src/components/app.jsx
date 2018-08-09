import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import TopBar from './top-bar/top-bar';
import SideBar from './side-bar/side-bar';
import {getFolders} from '../services/folder';
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
  }

  render() {
    return (
      <div className={styles.app}>
        <TopBar sideBarCollapsed={this.state.sideBar.collapsed} sideBarToggle={this.toggleSideBar.bind(this)}/>
        <SideBar collapsed={this.state.sideBar.collapsed}/>
        <div className={`${mainCss['mdc-top-app-bar--fixed-adjust']} ${styles['message-grid-wrapper']}`}>
          <div className={styles['message-grid']}>
            <ul className={`${mainCss['mdc-list']}`}>
              {this.props.messages.map((message, key) =>
                <li className={mainCss['mdc-list-item']} key={key}>{message.subject}</li>)}
            </ul>
          </div>
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
  messages: PropTypes.array.isRequired,
  addFolder: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({
  addFolder: () => {
    // dispatch(addFolder({name: 'New Folder'}));
    getFolders(dispatch);
  },

  addMessage: () => {
    dispatch(addMessage({subject: 'New Message'}));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
