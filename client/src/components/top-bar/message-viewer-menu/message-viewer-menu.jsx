import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import DownloadListItem from './download-list-item';
import ListUnsubscribeListItem from './list-unsubscribe-list-item';
import ReplyListItem from './reply-list-item';
import {getCredentials, selectedMessage as selectedMessageSelector} from '../../../selectors/application';
import {getSelectedFolder} from '../../../selectors/folders';
import {replyMessage as applicationReplyMessage} from '../../../services/application';
import {downloadMessage as downloadMessageService} from '../../../services/message';
import mainCss from '../../../styles/main.scss';

export const MessageViewerMenu = ({t, visible, selectedFolder, selectedMessage, replyMessage, downloadMessage}) =>
  selectedFolder && selectedMessage && (
    <div
      className={`${mainCss['message-viewer-menu']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
      ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
      aria-hidden={!visible}
    >
      <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
        <ReplyListItem t={t} replyAction={replyMessage}/>
        <DownloadListItem t={t} downloadMessage={downloadMessage}/>
        <ListUnsubscribeListItem t={t} message={selectedMessage}/>
      </ul>
    </div>
  );

MessageViewerMenu.propTypes = {
  t: PropTypes.func,
  visible: PropTypes.bool,
  credentials: PropTypes.object,
  selectedFolder: PropTypes.object,
  selectedMessage: PropTypes.object,
  replyMessage: PropTypes.func,
  downloadMessage: PropTypes.func
};

const mapStateToProps = state => ({
  credentials: getCredentials(state),
  selectedFolder: getSelectedFolder(state) || null,
  selectedMessage: selectedMessageSelector(state)
});

const mapDispatchToProps = dispatch => ({
  replyMessage: applicationReplyMessage(dispatch)
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  downloadMessage: async () =>
    downloadMessageService(stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessage),
  replyMessage: () => dispatchProps.replyMessage(stateProps.selectedMessage)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(MessageViewerMenu));
