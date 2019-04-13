import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {getSelectedFolder} from '../../selectors/folders';
import {getCredentials} from '../../selectors/application';
import {downloadMessage as downloadMessageService} from '../../services/message';
import styles from './message-viewer-menu.scss';
import mainCss from '../../styles/main.scss';

export const MessageViewerMenu = ({t, visible, selectedFolder, selectedMessage, downloadMessage}) =>
  selectedFolder && selectedMessage && (
    <div
      className={`${styles['message-viewer-menu']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
      ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
      aria-hidden={!visible}
    >
      <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
        <li
          className={mainCss['mdc-list-item']}
          onClick={downloadMessage}
        >{t('topBar.messageViewerMenu.download')}</li>
      </ul>
    </div>
  );

MessageViewerMenu.propTypes = {
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


const mapDispatchToProps = dispatch => ({
  downloadMessage: (credentials, folder, message) => downloadMessageService(dispatch, credentials, folder, message)
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  downloadMessage: () =>
    dispatchProps.downloadMessage(stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessage)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(MessageViewerMenu));
