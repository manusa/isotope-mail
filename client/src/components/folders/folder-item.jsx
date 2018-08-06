import React, {Component} from 'react';
import Link from 'react-router-dom/Link';
import mainCss from '../../styles/main.scss';

class FolderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {linkText: props.linkText};
  }

  render() {
    return (
      <Link className={mainCss['mdc-list-item']} to='#'>
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']}`}>folder</span>
        {this.state.linkText}
      </Link>
    );
  }
}

export default FolderItem;
