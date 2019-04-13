import React, {useState, useEffect} from 'react';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';
import mainCss from '../../styles/main.scss';

export const ButtonMore = ({t, children}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function closeMenu() {
      setMenuOpen(false);
    }
    window.addEventListener('click', closeMenu);
    return function unmount() {
      window.removeEventListener('click', closeMenu);
    };
  }, []);
  return (
    <span
      className={`${mainCss['mdc-menu-surface--anchor']}`}
      isotip={t('topBar.more')} isotip-position='bottom-end' isotip-size='small'
      isotip-hidden={menuOpen.toString()}>
      <TopBarButton
        onClick={event => {
          setMenuOpen(!menuOpen);
          event.stopPropagation();
        }}>more_vert</TopBarButton>
      {React.cloneElement(children, {visible: menuOpen})}
    </span>
  );
};

export default translate()(ButtonMore);
