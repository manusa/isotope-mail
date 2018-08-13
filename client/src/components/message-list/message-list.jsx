import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import {prettyDate, prettySize} from '../../services/prettify';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';


class MessageList extends Component {
  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner visible={this.props.messages.activeRequests > 0 && this.props.messages.items.length === 0} />
        {this.props.messages.items.length === 0 ? null :
          <ul className={`${mainCss['mdc-list']} ${styles.list}`}>
            {this.props.messages.items.map((message, key) =>
              <li key={key} className={`${mainCss['mdc-list-item']}
                ${styles.item} ${message.seen ? styles.seen : ''}`} >
                <span className={styles.from}>{this.parseFrom(message.from)}</span>
                <span className={styles.subject}>{message.subject}</span>
                <span className={styles.receivedDate}>{prettyDate(message.receivedDate)}</span>
                <span className={styles.size}>{prettySize(message.size)}</span>
              </li>)}
          </ul>
        }
      </div>
    );
  }

  parseFrom(from) {
    const firstFrom = from && from.length > 0 ? from[0] : '';
    const formattedFrom = firstFrom.match(/^\"([^\"]*?)\"/);
    return formattedFrom !== null ? formattedFrom[1] : firstFrom;
  }
}

MessageList.propTypes = {
  className: PropTypes.string
};

MessageList.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({ });

export default connect(mapStateToProps, mapDispatchToProps)(MessageList);
