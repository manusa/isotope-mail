import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {AutoSizer, List} from 'react-virtualized';
import Spinner from '../spinner/spinner';
import {prettyDate, prettySize} from '../../services/prettify';
import {selectMessage} from '../../actions/application';
import {readMessage} from '../../services/message';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';
import Checkbox from '../form/checkbox/checkbox';
import {setSelected} from '../../actions/messages';

function parseFrom(from) {
  const firstFrom = from && from.length > 0 ? from[0] : '';
  const formattedFrom = firstFrom.match(/^\"(.*)\"/);
  return formattedFrom !== null ? formattedFrom[1] : firstFrom;
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
    return (
      <li key={key} style={style}
        draggable={true} onDragStart={event => this.onDragStart(event, folder, message)}
        className={`${mainCss['mdc-list-item']}
                ${styles.item} ${message.seen ? styles.seen : ''}
                ${message.deleted ? styles.deleted : ''}`} >
        <Checkbox id={message.uid}
          onChange={event => this.props.messageSelected(message, event.target.checked)}
          checked={this.props.selectedMessages.indexOf(message.uid) > -1}
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
    const payload = {fromFolder, message};
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
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
  messageSelected: (message, selected) => dispatch(setSelected(message, selected))
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  messageClicked: message =>
    dispatchProps.messageClicked(stateProps.selectedFolder, message, stateProps.credentials)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(MessageList);
