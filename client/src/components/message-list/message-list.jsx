import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';


class MessageList extends Component {
  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner visible={this.props.messages.activeRequests > 0 && this.props.messages.items.length === 0} />
        {this.props.messages.items.length === 0 ? null :
          <ul className={`${mainCss['mdc-list']}`}>
            {this.props.messages.items.map((message, key) =>
              <li className={mainCss['mdc-list-item']} key={key}>
                <span className={styles.subject}>{message.subject}</span>
              </li>)}
          </ul>
        }
      </div>
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
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({ });

export default connect(mapStateToProps, mapDispatchToProps)(MessageList);
