import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import FolderList from './folder-list';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';
import {getMessages} from '../../services/message';

class FolderContainer extends Component {

  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Spinner visible={this.props.activeRequests > 0 && this.props.folderList.length === 0}
          canvasClassName={styles.spinnerCanvas} />
        <FolderList folderList={this.props.folderList} onClickFolder={this.props.onClickFolder.bind(this)} />
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
  onClickFolder: folder => {
    getMessages(dispatch, folder);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderContainer);
