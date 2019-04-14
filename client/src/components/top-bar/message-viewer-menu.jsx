import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {getSelectedFolder} from '../../selectors/folders';
import {getCredentials} from '../../selectors/application';
import {downloadMessage as downloadMessageService} from '../../services/message';
import styles from './message-viewer-menu.scss';
import mainCss from '../../styles/main.scss';
import Spinner from '../spinner/spinner';

export const DownloadListItem = ({t, downloadMessage}) => {
  const [downloading, setDownloading] = useState(false);
  const onDownloadClick = async () => {
    if (!downloading) {
      setDownloading(true);
      await downloadMessage();
      setDownloading(false);
    }
  };
  return (
    <li
      className={`${mainCss['mdc-list-item']} ${downloading ? mainCss['mdc-list-item--disabled'] : ''}`}
      onClick={onDownloadClick}
    >{t('topBar.messageViewerMenu.download')}</li>
  );
};

export const MessageViewerMenu = ({t, visible, selectedFolder, selectedMessage, downloadMessage}) =>
  selectedFolder && selectedMessage && (
    <div
      className={`${styles['message-viewer-menu']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
      ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
      aria-hidden={!visible}
    >
      <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
        <DownloadListItem t={t} downloadMessage={downloadMessage}/>
      </ul>
    </div>
  );

MessageViewerMenu.propTypes = {
  t: PropTypes.func,
  visible: PropTypes.bool,
  credentials: PropTypes.object,
  selectedFolder: PropTypes.object,
  selectedMessage: PropTypes.object,
  downloadMessage: PropTypes.func
};

const mapStateToProps = state => ({
  credentials: getCredentials(state),
  selectedFolder: getSelectedFolder(state) || null,
  selectedMessage: state.application.selectedMessage
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  downloadMessage: async () =>
    downloadMessageService(stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessage)
}));

export default connect(mapStateToProps, null, mergeProps)(translate()(MessageViewerMenu));
