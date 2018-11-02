import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {AutoSizer, List} from 'react-virtualized';
import Checkbox from '../form/checkbox/checkbox';
import Spinner from '../spinner/spinner';
import {prettyDate, prettySize} from '../../services/prettify';
import {selectMessage} from '../../actions/application';
import {setSelected} from '../../actions/messages';
import {readMessage} from '../../services/message';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';

function parseFrom(from) {
  const firstFrom = from && from.length > 0 ? from[0] : '';
  const formattedFrom = firstFrom.match(/^\"(.*)\"/);
  return formattedFrom !== null ? formattedFrom[1] : firstFrom;
}

function _dragImage(t, messages, x, y) {
  const imageNode = document.createElement('span');
  imageNode.draggable = true;
  imageNode.style.opacity = '1';
  imageNode.style.position = 'absolute';
  imageNode.style.top = `${Math.max(0, y)}px`;
  imageNode.style.left = `${Math.max(0, x)}px`;
  imageNode.style.pointerEvents = 'none';
  imageNode.style.padding = '6px';
  imageNode.style.backgroundColor = 'white';
  imageNode.innerHTML = t('messageList.moveEmails', {emailCount: messages.length});
  return imageNode;
}

class MessageList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner visible={this.props.activeRequests > 0 && this.props.messages.length === 0} />
        {this.props.messages.length === 0 ? null :
          <ul className={`${mainCss['mdc-list']} ${styles.list}`}>
            <AutoSizer defaultHeight={100}>
              {({height, width}) => (
                <List rowRenderer={this.renderItem.bind(this)}
                  height={height}
                  width={width}
                  rowCount={this.props.messages.length}
                  rowHeight={32}
                />
              )}
            </AutoSizer>
          </ul>
        }
        {this.props.activeRequests > 0 && this.props.messages.length > 0 ?
          (<Spinner className={styles.listSpinner} canvasClassName={styles.listSpinnerCanvas} />) :
          null
        }
      </div>
    );
  }

  renderItem({index, key, style}) {
    const folder = this.props.selectedFolder;
    const message = this.props.messages[index];
    const selected = this.props.selectedMessages.indexOf(message.uid) > -1;
    return (
      <li key={key} style={style}
        draggable={true}
        onDragStart={event => this.onDragStart(event, folder, message)}
        className={`${mainCss['mdc-list-item']}
                ${styles.item}
                ${message.seen ? styles.seen : ''}
                ${message.deleted ? styles.deleted : ''}`} >
        <Checkbox id={message.uid}
          onChange={event => this.selectMessage(event, message)}
          checked={selected}
        />
        <span className={styles.itemDetails}
          onClick={ () => this.props.messageClicked(message) }
          draggable={true} onDragStart={event => this.onDragStart(event, folder, message)}>
          <span className={styles.from}>{parseFrom(message.from)}</span>
          <span className={styles.subject}>{message.subject}</span>
          <span className={styles.receivedDate}>{prettyDate(message.receivedDate)}</span>
          <span className={styles.size}>{prettySize(message.size)}</span>
        </span>
      </li>
    );
  }

  onDragStart(event, fromFolder, message) {
    event.stopPropagation();
    const payload = {fromFolder};
    if (this.props.selectedMessages.length > 0) {
      // Prevent dragging single messages when there is a selection and message is not part of the selection
      if (this.props.selectedMessages.indexOf(message.uid) < 0) {
        event.preventDefault();
        return;
      }
      const messages = this.props.messages.filter(m => this.props.selectedMessages.indexOf(m.uid) > -1);
      if (event.dataTransfer.setDragImage) {
        const image = _dragImage(this.props.t, messages, event.pageX, event.pageY);
        const appendedImage = document.body.appendChild(image);
        setTimeout(() => document.body.removeChild(appendedImage));
        event.dataTransfer.setDragImage(image, -8, -16);
      }
      payload.messages = messages;
    } else {
      payload.messages = [message];
    }
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  }

  /**
   * Select/unselects the message for which the checkbox is changed.
   *
   * If the shift key is pressed, and it's a select operation, a range of messages will be selected. The range will be
   * the one consisting in the last selected message and the current message in any direction.
   *
   * @param event
   * @param message
   */
  selectMessage(event, message) {
    event.stopPropagation();
    const checked = event.target.checked;
    if (checked && event.nativeEvent && event.nativeEvent.shiftKey && this.props.selectedMessages.length > 0) {
      // Range selection
      const messagesToSelect = [];
      const lastSelectedMessageUid = this.props.selectedMessages[this.props.selectedMessages.length - 1];
      let selecting = false;
      this.props.messages.forEach(m => {
        if (m.uid === message.uid || m.uid === lastSelectedMessageUid) {
          selecting = !selecting;
          messagesToSelect.push(m);
        } else if (selecting) {
          messagesToSelect.push(m);
        }
      });
      this.props.messageSelected(messagesToSelect, checked);
    } else {
      // Single selection
      this.props.messageSelected([message], checked);
    }
  }
}


MessageList.propTypes = {
  className: PropTypes.string,
  selectedMessages: PropTypes.array
};

MessageList.defaultProps = {
  className: '',
  selectedMessages: []
};

const mapStateToProps = state => ({
  credentials: state.application.user.credentials,
  selectedFolder: state.folders.explodedItems[state.application.selectedFolderId] || {},
  activeRequests: state.messages.activeRequests,
  messages: state.application.selectedFolderId
    && state.messages.cache[state.application.selectedFolderId] ?
    Array.from(state.messages.cache[state.application.selectedFolderId].values())
      .sort((a, b) => {
        if (a.receivedDate > b.receivedDate) {
          return -1;
        } else if (a.receivedDate < b.receivedDate) {
          return 1;
        }
        return 0;
      }) : [],
  selectedMessages: state.messages.selected
});

const mapDispatchToProps = dispatch => ({
  messageClicked: (folder, message, credentials) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, folder, message);
  },
  messageSelected: (messages, selected, shiftKey) => dispatch(setSelected(messages, selected, shiftKey))
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  messageClicked: message =>
    dispatchProps.messageClicked(stateProps.selectedFolder, message, stateProps.credentials)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(MessageList));
