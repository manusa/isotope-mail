import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

class Spinner extends Component {
  render() {
    return this.props.visible ? (
      <div className={mainCss.spinner}>
        <svg className={`${mainCss.canvas} ${this.props.canvasClassName}`} width="55px" height="55px" viewBox="0 0 54 54"
          xmlns="http://www.w3.org/2000/svg">
          <circle className={`${mainCss.path} ${this.props.pathClassName}`}
            fill="none" cx="27" cy="27" r="24" />
        </svg>
      </div>
    ) : (null);
  }
}

Spinner.propTypes = {
  visible: PropTypes.bool,
  canvasClassName: PropTypes.string,
  pathClassName: PropTypes.string
};

Spinner.defaultProps = {
  canvasClassName: '',
  pathClassName: ''
};

export default Spinner;
