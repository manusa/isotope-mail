import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import {FolderTypes} from '../../services/folder';
import FolderList from './folder-list';
import {getMessages} from '../../services/message';
import {selectFolder} from '../../actions/folders';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';

class FolderContainer extends Component {
  constructor(props) {
    super(props);
    this.abortControllerWrapper = {};
  }

  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Spinner visible={this.props.activeRequests > 0 && this.props.folderList.length === 0}
          canvasClassName={styles.spinnerCanvas} />
        <FolderList folderList={this.props.folderList}
          selectedFolder={this.props.selectedFolder}
          onClickFolder={this.props.selectFolder.bind(this, this.abortControllerWrapper)} />
      </nav>
    );
  }

  componentDidMount() {
    this.loadInbox();
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // this.loadInbox();
  // }

  loadInbox() {
    // Initial list of folders loaded -> Select INBOX
    if (this.props.folderList && this.props.folderList.length > 0 && !this.props.selectedFolder.folderId) {
      const inbox = this.props.folderList.find(f => f.type === FolderTypes.INBOX);
      if (inbox) {
        this.props.selectFolder(this.abortControllerWrapper, inbox);
      }
    }
  }
}

FolderContainer.propTypes = {
  activeRequests: PropTypes.number.isRequired,
  folderList: PropTypes.array.isRequired,
  selectFolder: PropTypes.func
};

const mapStateToProps = state => ({
  activeRequests: state.folders.activeRequests,
  selectedFolder: state.folders.selected,
  folderList: state.folders.items
});

const mapDispatchToProps = dispatch => ({
  selectFolder: (abortControllerWrapper, folder) => {
    dispatch(selectFolder(folder));
    if (abortControllerWrapper && abortControllerWrapper.abortController) {
      abortControllerWrapper.abortController.abort();
    }
    abortControllerWrapper.abortController = new AbortController();
    getMessages(dispatch, folder, abortControllerWrapper.abortController.signal);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderContainer);
