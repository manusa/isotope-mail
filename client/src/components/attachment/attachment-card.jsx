import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {prettySize} from '../../services/prettify';
import {credentialsHeaders} from '../../services/fetch';
import mainCss from '../../styles/main.scss'; // NOSONAR
import styles from './attachment-card.scss';

class AttachmentCard extends Component {
  render() {
    const attachment = this.props.attachment;
    return (
      <div className={styles.attachment} onClick={() => this.download(attachment)}>
        <div className={styles.fileName}>{attachment.fileName}</div>
        <div className={styles.size}>{prettySize(attachment.size)}</div>
      </div>
    );
  }

  download(attachment) {
    fetch(attachment._links.download.href, {
      method: 'GET',
      headers: credentialsHeaders(this.props.credentials)
    })
      .then(response => response.blob())
      .then(blob => {
        const tempLink = document.createElement('a');
        tempLink.href = window.URL.createObjectURL(blob);
        tempLink.download = attachment.fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      });
  }
}


AttachmentCard.propTypes = {
  attachment: PropTypes.object
};

const mapStateToProps = state => ({
  credentials: state.application.user.credentials
});

export default connect(mapStateToProps)(AttachmentCard);
