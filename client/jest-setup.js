import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

// Mock modal-root container for dynamic components using createPortal
// add a div with #modal-root id to the global body
const modalRoot = document.createElement('div');
modalRoot.setAttribute('id', 'modal-root');
document.querySelector('body').appendChild(modalRoot);
