import get from 'lodash/get';
import {getIsotopeConfiguration} from '../selectors/globals';

export const googleAnalyticsTrackingId = () => get(getIsotopeConfiguration(), 'googleAnalyticsTrackingId');
