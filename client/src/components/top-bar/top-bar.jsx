import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {selectMessage} from '../../actions/application';
import styles from './top-bar.scss';
import mainCss from '../../styles/main.scss';

class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className={`${styles.topBar} ${styles['with-custom-styles']}
      ${this.props.sideBarCollapsed ? '' : styles['with-side-bar']}
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']}`}>
        <div className={mainCss['mdc-top-app-bar__row']}>
          <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
            <button onClick={this.props.sideBarToggle}
              className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
              menu
            </button>
            {this.props.selectedMessage && Object.keys(this.props.selectedMessage).length > 0 ?
              <button onClick={() => this.props.selectMessage(null)}
                className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
                arrow_back
              </button>
              :
              null
            }
            <span className={mainCss['mdc-top-app-bar__title']}>{this.props.title}</span>
          </section>
        </div>
      </header>
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  selected: PropTypes.object,
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired,
  selectMessage: PropTypes.func
};

const mapStateToProps = state => ({
  title: state.application.title,
  selectedMessage: state.application.selectedMessage
});

const mapDispatchToProps = dispatch => ({
  selectMessage: message => dispatch(selectMessage(message))
});
export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
