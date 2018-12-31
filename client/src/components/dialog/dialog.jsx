import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Button from '../buttons/button';
import mainCss from '../../styles/main.scss';

const modalRoot = document.getElementById('modal-root');

class Dialog extends Component {
  render() {
    const {visible, scrimClick, title, children, actions,
      className, containerClassName, contentClassName} = this.props;
    const dialog = (
      <div
        className={`${mainCss['mdc-dialog']} ${className} ${visible ? mainCss['mdc-dialog--open'] : ''}`}
        role='alertdialog'
        aria-modal='true'>
        <div className={`${mainCss['mdc-dialog__container']} ${containerClassName}`}>
          <div className={mainCss['mdc-dialog__surface']}>
            <h2 className={mainCss['mdc-dialog__title']}>{/* No White space allowed before */title}</h2>
            <div className={`${mainCss['mdc-dialog__content']} ${contentClassName}`}>
              {visible ? children : null}
            </div>
            <footer className={mainCss['mdc-dialog__actions']}>
              {actions.map((a, index) => (
                <Button
                  key={index} className={mainCss[' mdc-dialog__button']} label={a.label} onClick={a.action}
                  disabled={a.disabled === true}
                />
              ))}
            </footer>
          </div>
        </div>
        <div className={mainCss['mdc-dialog__scrim']} onClick={scrimClick}></div>
      </div>
    );
    return ReactDOM.createPortal(dialog, modalRoot);
  }
}

Dialog.propTypes = {
  visible: PropTypes.bool,
  scrimClick: PropTypes.func,
  title: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    action: PropTypes.func
  })),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  contentClassName: PropTypes.string
};

Dialog.defaultProps = {
  visible: true,
  scrimClick: () => {},
  title: '',
  actions: [],
  className: '',
  containerClassName: '',
  contentClassName: ''
};

export default Dialog;
