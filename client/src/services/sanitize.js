import sanitize from 'dompurify';
import ReactDOMServer from 'react-dom/server';
import {renderSpinner} from '../components/spinner/spinner';

sanitize.addHook('afterSanitizeAttributes', node => {
  // set all elements owning target to target=_blank -> Open URLS in new tab
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
  // set non-HTML/MathML links to xlink:show=new
  if (!node.hasAttribute('target')
    && (node.hasAttribute('xlink:href')
      || node.hasAttribute('href'))) {
    node.setAttribute('xlink:show', 'new');
  }

  // FIX Image aspect ratio
  if (node.nodeName === 'IMG' && node.width) {
    node.style.width = '';
    node.style.height = '';
    if (node.width) {
      node.style.width = `${node.width}px`;
      node.removeAttribute('width');
    }
    node.removeAttribute('height');
  }

  // FIX HR overflow
  if (node.nodeName === 'HR' && node.width) {
    node.removeAttribute('width');
  }
});

const ISOTOPE_WHITELISTED_URL = '#IsotopeEmbedded';

// 1/2 Replaces "insecure" blob: uris before sanitation for controlled ones
sanitize.addHook('uponSanitizeAttribute', (node, hookEvent) => {
  if (node.nodeName === 'IMG' && hookEvent.attrName === 'src' && hookEvent.attrValue.indexOf('blob:') === 0) {
    node.src = `${node.src.substring(5)}${ISOTOPE_WHITELISTED_URL}`;
    hookEvent.attrValue = node.src;
  }
});

// 2/2 Replaces previously parsed "insecure" urls to original ones -> Whitelist effect
// Hides cid: images that are being loaded
sanitize.addHook('afterSanitizeAttributes', node => {
  if (node.nodeName === 'IMG' && node.src && node.src.indexOf(ISOTOPE_WHITELISTED_URL) > -1) {
    node.src = `blob:${node.src.replace(ISOTOPE_WHITELISTED_URL, '')}`;
  }
  if (node.nodeName === 'IMG' && node.src && node.src.indexOf('cid:') === 0) {
    const spinner = document.createElement('div');
    spinner.innerHTML = ReactDOMServer.renderToStaticMarkup(renderSpinner());
    spinner.getElementsByClassName('canvas')[0].style.height = node.height ? node.height : '22px';
    node.parentElement.replaceChild(spinner, node);
  }
});
export default sanitize;
