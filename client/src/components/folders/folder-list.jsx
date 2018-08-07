import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FolderItem from './folder-item';
import mainCss from '../../styles/main.scss';

class FolderList extends Component {
  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Link className={`${mainCss['mdc-list-item']}`} to='/mui-components'>
          <i className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>inbox</i>
          Inbox
        </Link>
        {this.props.folderList.map((folder, index) => <FolderItem key={index} label={folder.name}></FolderItem>)}
      </nav>
    );
  }
}

FolderList.propTypes = {
  folderList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  folderList: state.folders
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FolderList);
