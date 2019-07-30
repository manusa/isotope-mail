import React from 'react';
import {googleAnalyticsTrackingId} from './selectors';

const GoogleAnalytics = () => {
  const trackingId = googleAnalyticsTrackingId();
  return trackingId && (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
      <script>
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${trackingId}');
      `}
      </script>
    </>
  );
};

export default GoogleAnalytics;
