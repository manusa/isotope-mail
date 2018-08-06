import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import mainCss from '../../styles/main.scss';

class FolderItem extends Component {
  render() {
    return (
      <Link className={mainCss['mdc-list-item']} to='#'>
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>folder</span>
        {this.props.label}
      </Link>
    );
  }
}

FolderItem.propTypes = {
  label: PropTypes.string.isRequired
};

export default FolderItem;
