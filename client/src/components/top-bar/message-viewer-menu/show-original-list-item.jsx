import React, {useState} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

const ShowOriginalListItem = ({t, showOriginal}) => {
  const [downloading, setDownloading] = useState(false);
  const onClick = async () => {
    if (!downloading) {
      setDownloading(true);
      await showOriginal();
      setDownloading(false);
    }
  };
  return (
    <li
      className={`${mainCss['mdc-list-item']} ${downloading ? mainCss['mdc-list-item--disabled'] : ''}`}
      onClick={onClick}
    >
      <span className={`${mainCss['mdc-list-item__graphic']} material-icons`}>description</span>
      {t('topBar.messageViewerMenu.showOriginal')}
    </li>
  );
};

ShowOriginalListItem.propTypes = {
  t: PropTypes.func.isRequired,
  showOriginal: PropTypes.func.isRequired
};

export default ShowOriginalListItem;
