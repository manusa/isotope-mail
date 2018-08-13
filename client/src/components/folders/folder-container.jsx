import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import FolderList from './folder-list';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';
import {getMessages} from '../../services/message';

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
          onClickFolder={this.props.onClickFolder.bind(this, this.abortControllerWrapper)} />
      </nav>
    );
  }
}

FolderContainer.propTypes = {
  activeRequests: PropTypes.number.isRequired,
  folderList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  activeRequests: state.folders.activeRequests,
  folderList: state.folders.items
});

const mapDispatchToProps = dispatch => ({
  onClickFolder: (abortControllerWrapper, folder) => {
    if (abortControllerWrapper && abortControllerWrapper.abortController) {
      abortControllerWrapper.abortController.abort();
    }
    abortControllerWrapper.abortController = new AbortController();
    getMessages(dispatch, folder, abortControllerWrapper.abortController.signal);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderContainer);
