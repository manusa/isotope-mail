import React, {Component} from 'react';
import {connect} from 'react-redux';
import Snackbar from '../snackbar/snackbar';
import {translate} from 'react-i18next';

export class MessageSnackbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {outbox, t} = this.props;
    let message;
    if (outbox === null) {
      message = '';
    } else if (outbox.sent) {
      message = t('messageSnackbar.messageSent');
    } else {
      message = t('messageSnackbar.sendingMessage', {progress: outbox.progress * 100});
    }
    return (
      <Snackbar show={outbox !== null} alignStart={true} message={message}/>
    );
  }
}

const mapStateToProps = state => ({
  outbox: state.application.outbox
});

export default connect(mapStateToProps)(translate()(MessageSnackbar));
