const editorConfig = {
  menubar: false,
  statusbar: false,
  toolbar: false,
  plugins: 'autoresize lists',
  content_style: 'body {padding:0}', // DOESN'T WORK
  browser_spellcheck: true,
  paste_data_images: true,
  entity_encoding: 'named', // Converts characters to html entities ' ' > &nbsp;
  formats: {
    isotope_code: {
      block: 'pre', classes: ['code']
    }
  }
};

export default editorConfig;
