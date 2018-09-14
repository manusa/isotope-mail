import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import {selectFolder, selectMessage} from '../../actions/application';
import sanitize from '../../services/sanitize';
import mainCss from '../../styles/main.scss';
import styles from './message-viewer.scss';
import AttachmentCard from '../attachment/attachment-card';

function addressGroups(address) {
  const ret = {
    name: '',
    email: ''
  };
  const formattedFrom = address.match(/^\"(.*)\"/);
  ret.name = formattedFrom !== null ? formattedFrom[1] : address;
  ret.email = formattedFrom !== null ? address.substring(formattedFrom[0].length).trim().replace(/[\<\>]/g, '') : '';
  return ret;
}

class MessageViewer extends Component {
  render() {
    const t = this.props.t;
    const folder = this.props.selectedFolder;
    const message = this.props.selectedMessage;
    const firstFrom = addressGroups(message.from && message.from.length > 0 ? message.from[0] : '');
    const to = message.recipients.filter(r => r.type === 'To');
    const firstTo = addressGroups(to && to.length > 0 ? to[0].address : '');
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
              <span className={styles.name}>{firstFrom.name}</span>
              <span className={styles.email}>{firstFrom.email}</span>
            </div>
            <div className={styles.date}>
              {new Date(message.receivedDate).toLocaleString(navigator.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </div>
          <div className={styles.to}>
            <label>{t('messageViewer.to')}: </label>
            <span className={styles.name}>{firstTo.name}</span>
            <span className={styles.email}>{firstTo.email ? `<${firstTo.email}>` : ''}</span>
          </div>
        </div>
        <div className={styles.body}>
          <Spinner visible={this.props.activeRequests > 0}/>
          <div className={styles.attachments}>
            {attachments.map((a, index) => <AttachmentCard key={index} attachment={a} />)}
          </div>
          <div dangerouslySetInnerHTML={{__html: sanitize.sanitize(message.content)}}></div>
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
  selectedFolder: state.application.selectedFolder,
  selectedMessage: state.application.selectedMessage
});

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    dispatch(selectMessage(null));
    dispatch(selectFolder(folder));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageViewer));
