import React from 'react';
import {translate} from 'react-i18next';
import mainCss from '../../styles/main.scss';

export const ConfigurationNotFound = ({t}) => (
  <div className={mainCss['isotope-error-page']}>
    <div className={mainCss['isotope-error-page__overlay']}>
      <div className={mainCss['isotope-error-page__container']}>
        <h1>{t('configurationNotFound.Sorry')}</h1>
        <p>{t('configurationNotFound.message')}</p>
        <a
          className={
            `${mainCss['mdc-button']} ${mainCss['mdc-button--outlined']} ${mainCss['isotope-error-page__button']}`}
          href={'/'}>{t('configurationNotFound.Retry')}</a>
      </div>
    </div>
  </div>
);

export default translate()(ConfigurationNotFound);
