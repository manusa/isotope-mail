import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

export function renderSpinner(className = '', canvasClassName = '', pathClassName = '') {
  return (<div className={`${mainCss.spinner} ${className}`}>
    <svg className={`${mainCss.canvas} ${canvasClassName}`} width="55px" height="55px" viewBox="0 0 54 54"
      xmlns="http://www.w3.org/2000/svg">
      <circle className={`${mainCss.path} ${pathClassName}`}
        fill="none" cx="27" cy="27" r="24" />
    </svg>
  </div>);
}

const Spinner = ({visible, className, canvasClassName, pathClassName}) =>
  (visible &&
    renderSpinner(className, canvasClassName, pathClassName)
  );

Spinner.propTypes = {
  visible: PropTypes.bool,
  className: PropTypes.string,
  canvasClassName: PropTypes.string,
  pathClassName: PropTypes.string
};

Spinner.defaultProps = {
  visible: true,
  className: '',
  canvasClassName: '',
  pathClassName: ''
};

export default Spinner;
