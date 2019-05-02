import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';
import FilterDialog from './filter-dialog';
import MessageFilters, {getFromKey} from '../../services/message-filters';
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
    const {t, activeMessageFilter} = this.props;
    const {dialogVisible} = this.state;
    const active = activeMessageFilter.key !== MessageFilters.ALL.key;
    return <span
      className={`${styles['button-filter']} ${mainCss['mdc-menu-surface--anchor']}`}
      isotip={t('topBar.quickFilter')} isotip-position='bottom-end' isotip-size='small'
      isotip-hidden={dialogVisible.toString()}>
      <TopBarButton
        className={`${styles['button-filter--button']} ${active ? styles.active : ''}`}
        onClick={this.handleOnToggleDialog}>filter_list</TopBarButton>
      <FilterDialog visible={dialogVisible} />
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
    this.setState({dialogVisible: false});
  }
}

const mapStateToProps = state => ({
  activeMessageFilter: getFromKey(state.application.messageFilterKey)
});

export default connect(mapStateToProps)(translate()(ButtonFilter));
