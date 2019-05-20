import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';
import FilterDialog from './filter-dialog';
import {messageFilterActive} from '../../selectors/application';
import mainCss from '../../styles/main.scss';
import styles from './button-filter.scss';

export class ButtonFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false
    };
    this.handleOnToggleDialog = this.onToggleDialog.bind(this);
    this.handleOnCloseDialog = this.onCloseDialog.bind(this);
  }

  render() {
    const {t, active} = this.props;
    const {dialogVisible} = this.state;
    return <span
      className={`${styles['button-filter']} ${mainCss['mdc-menu-surface--anchor']}`}
      isotip={t('topBar.quickFilter')} isotip-position='bottom-end' isotip-size='small'
      isotip-hidden={dialogVisible.toString()}>
      <TopBarButton
        className={`${styles['button-filter--button']} ${active ? styles.active : ''}`}
        onClick={this.handleOnToggleDialog}>filter_list</TopBarButton>
      <FilterDialog visible={dialogVisible} closeFilterDialogHandler={this.handleOnCloseDialog} />
    </span>;
  }

  componentDidMount() {
    window.addEventListener('click', this.handleOnCloseDialog);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleOnCloseDialog);
  }

  onToggleDialog(event) {
    this.setState(previousState => ({dialogVisible: !previousState.dialogVisible}));
    event.stopPropagation();
  }

  onCloseDialog() {
    if (this.handleOnCloseDialog.disabled !== true) {
      this.setState({dialogVisible: false});
    }
    delete this.handleOnCloseDialog.disabled;
  }
}

const mapStateToProps = state => ({
  active: messageFilterActive(state)
});

export default connect(mapStateToProps)(translate()(ButtonFilter));
