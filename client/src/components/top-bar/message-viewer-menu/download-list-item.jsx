import React, {useState} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

const DownloadListItem = ({t, downloadMessage}) => {
  const [downloading, setDownloading] = useState(false);
  const onDownloadClick = async () => {
    if (!downloading) {
      setDownloading(true);
      await downloadMessage();
      setDownloading(false);
    }
  };
  return (
    <li
      className={`${mainCss['mdc-list-item']} ${downloading ? mainCss['mdc-list-item--disabled'] : ''}`}
      onClick={onDownloadClick}
    >
      <span className={`${mainCss['mdc-list-item__graphic']} material-icons`}>save_alt</span>
      {t('topBar.messageViewerMenu.download')}
    </li>
  );
};

DownloadListItem.propTypes = {
  t: PropTypes.func.isRequired,
  downloadMessage: PropTypes.func.isRequired
};

export default DownloadListItem;
