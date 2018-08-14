import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {AutoSizer, List} from 'react-virtualized';
import Spinner from '../spinner/spinner';
import {prettyDate, prettySize} from '../../services/prettify';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';

function parseFrom(from) {
  const firstFrom = from && from.length > 0 ? from[0] : '';
  const formattedFrom = firstFrom.match(/^\"([^\"]*?)\"/);
  return formattedFrom !== null ? formattedFrom[1] : firstFrom;
}

class MessageList extends Component {
  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner visible={this.props.messages.activeRequests > 0 && this.props.messages.items.length === 0} />
        {this.props.messages.items.length === 0 ? null :
          <ul className={`${mainCss['mdc-list']} ${styles.list}`}>
            <AutoSizer defaultHeight={100}>
              {({height, width}) => (
                <List rowRenderer={this.renderItem.bind(this)}
                  height={height}
                  width={width}
                  rowCount={this.props.messages.items.length}
                  rowHeight={32}
                />
              )}
            </AutoSizer>
          </ul>
        }
      </div>
    );
  }

  renderItem({index, key, style}) {
    const message = this.props.messages.items[index];
    return (
      <li key={key} style={style} className={`${mainCss['mdc-list-item']}
                ${styles.item} ${message.seen ? styles.seen : ''}`} >
        <span className={styles.from}>{parseFrom(message.from)}</span>
        <span className={styles.subject}>{message.subject}</span>
        <span className={styles.receivedDate}>{prettyDate(message.receivedDate)}</span>
        <span className={styles.size}>{prettySize(message.size)}</span>
      </li>
    );
  }
}

MessageList.propTypes = {
  className: PropTypes.string
};

MessageList.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  selectedFolder: state.folders.selected,
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({ });

export default connect(mapStateToProps, mapDispatchToProps)(MessageList);
