import {useEffect} from 'react';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import {googleAnalyticsTrackingId} from './selectors';

const updateLocation = trackingId => {
  if (isFunction(window.gtag)) {
    window.gtag('config', trackingId, {
      page_path: get(window, 'location.pathname')
    });
  }
};

export const useAnalytics = () => {
  const trackingId = googleAnalyticsTrackingId();
  if (trackingId) {
    useEffect(() => {
      const scriptLoader = document.createElement('script');
      scriptLoader.async = true;
      scriptLoader.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      document.body.appendChild(scriptLoader);
      window.gtag = function gtag() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      updateLocation(trackingId);
      return () => document.body.removeChild(scriptLoader);
    }, []);
  }
};

export const updateAnalytics = () => {
  const trackingId = googleAnalyticsTrackingId();
  if (trackingId) {
    useEffect(() => {
      updateLocation(trackingId);
    });
  }
};
