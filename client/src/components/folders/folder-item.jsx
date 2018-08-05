import React, {Component} from 'react';
import Link from 'react-router-dom/Link';
import mdcList from '@material/list/mdc-list.scss';

class FolderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {linkText: props.linkText};
  }

  render() {
    return (
      <Link className={mdcList['mdc-list-item']} to='#'>
        <span className={`material-icons ${mdcList['mdc-list-item__graphic']}`}>folder</span>
        {this.state.linkText}
      </Link>
    );
  }
}

export default FolderItem;
