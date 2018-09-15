import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {selectMessage} from '../../actions/application';
import styles from './top-bar.scss';
import mainCss from '../../styles/main.scss';
import {FolderTypes} from '../../services/folder';

class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const isMessageViewer = this.props.selectedMessage && Object.keys(this.props.selectedMessage).length > 0;
    let title = this.props.title;
    if (this.props.selectedFolder && this.props.selectedFolder.name
      && this.props.selectedFolder.type !== FolderTypes.INBOX) {
      title = `${this.props.selectedFolder.name} - ${title}`;
    }
    return (
      <header className={`${styles.topBar} ${styles['with-custom-styles']}
      ${collapsed ? '' : styles['with-side-bar']}
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']}`}>
        <div className={mainCss['mdc-top-app-bar__row']}>
          <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
            {collapsed ?
              <button onClick={this.props.sideBarToggle}
                className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
                menu
              </button> :
              null
            }
            {isMessageViewer ?
              <Fragment>
                <button onClick={() => this.props.selectMessage(null)}
                  className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
                  arrow_back
                </button>
              </Fragment>
              :
              <span className={mainCss['mdc-top-app-bar__title']}>{title}</span>
            }
          </section>
        </div>
      </header>
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  selectedFolder: PropTypes.object,
  selectMessage: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  title: state.application.title,
  selectedFolder: state.application.selectedFolder,
  selectedMessage: state.application.selectedMessage
});

const mapDispatchToProps = dispatch => ({
  selectMessage: message => dispatch(selectMessage(message))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
