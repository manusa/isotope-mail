import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {login} from '../../services/application';
import TextField from '../form/text-field/text-field';
import Spinner from '../spinner/spinner';
import mainCss from '../../styles/main.scss';
import styles from './login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        serverHost: '',
        serverPort: '',
        user: '',
        password: ''
      }
    };
    this.onFieldChange = this.onFieldChange.bind(this);
    this.login = this.login.bind(this);
  }

  render() {
    const t = this.props.t;
    if (this.props.application.user.credentials) {
      return <Redirect to="/"/>;
    }
    return (
      <div className={styles.login}>
        <Spinner visible={this.props.application.activeRequests > 0} className={styles.spinner}/>
        <div className={`${mainCss['mdc-card']} ${styles.card}`}>
          <header>
            <h1 className={styles.title}>{this.props.application.title}</h1>
            <h2 className={styles.subtitle}>{t('login.Login')}</h2>
          </header>
          <form onSubmit={this.login}>
            <div className={styles.server}>
              <TextField id='serverHost' fieldClass={`${styles.formField} ${styles.serverHost}`}
                value={this.state.values.serverHost} onChange={this.onFieldChange}
                focused={this.isFocused('serverHost')} required={true} autoComplete='on' label={t('login.Host')}/>
              <TextField key='serverPort' id='serverPort' fieldClass={`${styles.formField} ${styles.serverPort}`}
                type='number' min='0'
                value={this.state.values.serverPort} onChange={this.onFieldChange}
                focused={this.isFocused('serverPort')} required={true} autoComplete='on' label={t('login.Port')}/>
            </div>
            <TextField id='user' fieldClass={`${styles.formField} ${styles.fullWidth}`}
              value={this.state.values.user} onChange={this.onFieldChange}
              focused={this.isFocused('user')} required={true} autoComplete='on' label={t('login.User')}/>
            <TextField id='password' type={'password'} fieldClass={`${styles.formField} ${styles.fullWidth}`}
              value={this.state.values.password} onChange={this.onFieldChange}
              focused={this.isFocused('password')} required={true} label={t('login.Password')}/>
            <button type='submit' className={`${styles.loginButton}
              ${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
              ${styles.fullWidth}`}>
              {t('login.actions.Login')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  isFocused(componentId) {
    return componentId === this.state.focusedComponentId;
  }

  onFieldChange(event) {
    const target = event.target;
    this.setState(prevState => {
      const newState = {...prevState};
      newState.focusedComponentId = target.id;
      newState.values = {...prevState.values};
      newState.values[target.id] = target.value;
      return newState;
    });
  }

  login(event) {
    event.preventDefault();
    this.props.dispatchLogin(this.state.values);
  }
}

Login.propTypes = {
  application: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  application: state.application
});

const mapDispatchToProps = dispatch => ({
  dispatchLogin: credentials => login(dispatch, credentials)
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(withRouter(Login)));
