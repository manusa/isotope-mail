import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import HeaderTo from './header-to';
import AttachmentCard from '../attachment/attachment-card';
import {selectFolder} from '../../actions/application';
import sanitize from '../../services/sanitize';
import mainCss from '../../styles/main.scss';
import styles from './message-viewer.scss';
import {clearSelectedMessage} from '../../services/application';

export function addressGroups(address) {
  const ret = {
    name: '',
    email: ''
  };
  const formattedFrom = address.match(/^"(.*)"/);
  ret.name = formattedFrom !== null ? formattedFrom[1] : address;
  ret.email = formattedFrom !== null ? address.substring(formattedFrom[0].length).trim().replace(/[<>]/g, '') : '';
  return ret;
}

export class MessageViewer extends Component {
  render() {
    const folder = this.props.currentFolder;
    const message = this.props.selectedMessage;
    const firstFrom = addressGroups(message.from && message.from.length > 0 ? message.from[0] : '');
    const attachments = message.attachments ? message.attachments.filter(a => !a.contentId) : [];
    return (
      <div className={`${this.props.className} ${styles.messageViewer}`}>
        <div className={styles.header}>
          <h1 className={styles.subject}>
            {this.props.selectedMessage.subject}
            <div className={`${styles.folder} ${mainCss['mdc-chip']}`} onClick={() => this.onFolderClick(folder)}>
              <div className={mainCss['mdc-chip__text']}>{folder.name}</div>
            </div>
          </h1>
          <div className={styles.fromDate}>
            <div className={styles.from}>
              <span className={styles.fromName}>{firstFrom.name}</span>
              <span className={styles.email}>{firstFrom.email}</span>
            </div>
            <div className={styles.date}>
              {new Date(message.receivedDate).toLocaleString(navigator.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </div>
          <HeaderTo className={styles.to} recipients={message.recipients} />
        </div>
        <div className={styles.body}>
          <Spinner visible={this.props.activeRequests > 0 && !message.content}/>
          <div className={styles.attachments}>
            {attachments.map((a, index) => <AttachmentCard key={index} attachment={a} />)}
          </div>
          <div dangerouslySetInnerHTML={{__html: sanitize.sanitize(message.content)}}>
          </div>
        </div>
      </div>
    );
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }
}

MessageViewer.propTypes = {
  activeRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

MessageViewer.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  activeRequests: state.application.activeRequests,
  currentFolder: state.folders.explodedItems[state.application.selectedFolderId] || {},
  selectedMessage: state.application.selectedMessage
});

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageViewer);
