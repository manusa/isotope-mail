import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getCredentials} from '../../selectors/application';
import {downloadAttachment} from '../../services/message';
import {prettySize} from '../../services/prettify';
import Spinner from '../spinner/spinner';
import mainCss from '../../styles/main.scss'; // NOSONAR
import styles from './attachment-card.scss';

export class AttachmentCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false
    };
  }

  render() {
    const attachment = this.props.attachment;
    return (
      <div className={`${styles.attachment} ${this.state.downloading ? styles.downloading : ''}`}
        onClick={() => this.download(attachment)}
        isotip={attachment.fileName} isotip-position='bottom'>
        <Spinner className={styles.spinner} canvasClassName={styles.canvas} visible={this.state.downloading}/>
        <div className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.icon}`}>
          attach_file
        </div>
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{attachment.fileName}</div>
          <div className={styles.size}>{prettySize(attachment.size)}</div>
        </div>
      </div>
    );
  }

  download(attachment) {
    if (this.state.downloading) {
      return;
    }
    this.setState({
      downloading: true
    });
    const ieCompatibleFinally = () =>
      this.setState({
        downloading: false
      });
    downloadAttachment(this.props.credentials, attachment)
      .then(ieCompatibleFinally)
      .catch(ieCompatibleFinally);
  }
}


AttachmentCard.propTypes = {
  attachment: PropTypes.object
};

const mapStateToProps = state => ({
  credentials: getCredentials(state)
});

export default connect(mapStateToProps)(AttachmentCard);
