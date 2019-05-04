import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import HeaderTo from './header-to';
import AttachmentCard from '../attachment/attachment-card';
import {selectFolder} from '../../actions/application';
import {getSelectedFolder} from '../../selectors/folders';
import {clearSelectedMessage, mailto} from '../../services/application';
import {imageUrl} from '../../services/gravatar';
import sanitize from '../../services/sanitize';
import mainCss from '../../styles/main.scss';

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
  constructor(props) {
    super(props);
    this.handleWindowOnClick = this.windowOnClick.bind(this);
  }

  render() {
    const folder = this.props.currentFolder;
    const message = this.props.selectedMessage;
    const firstFrom = addressGroups(message.from && message.from.length > 0 ? message.from[0] : '');
    const attachments = message.attachments ? message.attachments.filter(a => !a.contentId) : [];
    return (
      <div className={`${this.props.className} ${mainCss['message-viewer']}`}>
        <div className={mainCss['message-viewer__header']}>
          <div className={mainCss['message-viewer__subject-container']}>
            <div className={mainCss['message-viewer__gravatar']}>
              <img
                className={mainCss['message-viewer__gravatar-image']}
                src={imageUrl(firstFrom.email.length > 0 ? firstFrom.email : firstFrom.name, {defaultImage: 'retro'})}
              />
            </div>
            <h1 className={mainCss['message-viewer__subject']}>
              {this.props.selectedMessage.subject}
              <div className={`${mainCss['message-viewer__folder']} ${mainCss['mdc-chip']}`} onClick={() => this.onFolderClick(folder)}>
                <div className={mainCss['mdc-chip__text']}>{folder.name}</div>
              </div>
            </h1>
          </div>
          <div className={mainCss['message-viewer__from-date-container']}>
            <div className={mainCss['message-viewer__from']}>
              <span className={mainCss['message-viewer__name']}>{firstFrom.name}</span>
              <span className={mainCss['message-viewer__email']}>{firstFrom.email}</span>
            </div>
            <div className={mainCss['message-viewer__date']}>
              {new Date(message.receivedDate).toLocaleString(navigator.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </div>
          <HeaderTo className={mainCss['message-viewer__to']} recipients={message.recipients} />
        </div>
        <div className={mainCss['message-viewer__body']}>
          <Spinner visible={this.props.refreshMessageActiveRequests > 0 && !message.content}/>
          <div className={mainCss['message-viewer__attachments']}>
            {attachments.map((a, index) => <AttachmentCard key={index} attachment={a} />)}
          </div>
          <div dangerouslySetInnerHTML={{__html: sanitize.sanitize(message.content)}}>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowOnClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowOnClick);
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }

  windowOnClick(event) {
    const {target} = event;
    const link = target.tagName === 'A' ? target : target.closest('A');
    if (link && link.href && link.href.indexOf('mailto:') === 0) {
      event.preventDefault();
      const mailtoUrl = new URL(link.href);
      const headers = Array.from(mailtoUrl.searchParams.entries()).reduce(
        (acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {});
      this.props.mailto(mailtoUrl.pathname, headers);
    }
  }
}

MessageViewer.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

MessageViewer.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  refreshMessageActiveRequests: state.application.refreshMessageActiveRequests,
  currentFolder: getSelectedFolder(state) || {},
  selectedMessage: state.application.selectedMessage
});

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  },
  mailto: (to, headers) => mailto(dispatch, to, headers)
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageViewer);
