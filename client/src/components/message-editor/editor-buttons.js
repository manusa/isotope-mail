function _alwaysFalse() {
  return false;
}

function _isStyled({editor, button}) {
  if (!editor || !editor.selection) {
    return false;
  }
  return editor.queryCommandState(button.command);
}

function _isBlockStyled({key, node}) {
  return node.tagName === key;
}

function _isBlockStyledFromParent({key, node}) {
  return node.closest(key) !== null;
}

function _isBlockLink({node}) {
  return _isBlockStyled({key: 'A', node}) || node.parentElement.tagName === 'A';
}

function _toggleStyle(editor, button) {
  editor.execCommand(button.command);
}

function _toggleBlockStyle(editor, button) {
  // Remove font-size
  Array.from(editor.selection.getNode().getElementsByTagName('*')).forEach(e => {
    e.style['font-size'] = '';
  });
  // editor.execCommand('mceToggleFormat', false, button.blockCommand);
  editor.execCommand('FormatBlock', false, button.blockCommand);
}

function _editLink(editor, button, parentSetState) {
  let linkDialogUrl = '';
  const node = editor.selection.getNode();
  if (node.tagName === 'A') {
    linkDialogUrl = node.getAttribute('href');
  } else if (node.parentNode && node.parentNode.tagName === 'A') { // Images / <spans> for styles / ...
    linkDialogUrl = node.parentNode.getAttribute('href');
  }
  parentSetState({linkDialogVisible: true, linkDialogUrl});
}

const editorButtons = {
  bold: {
    command: 'bold', icon: 'format_bold',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  italic: {
    command: 'italic', icon: 'format_italic',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  underline: {
    command: 'underline', icon: 'format_underline',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  UL: {
    command: 'InsertUnorderedList', icon: 'format_list_bulleted',
    activeFunction: _isBlockStyledFromParent, toggleFunction: _toggleStyle},
  OL: {
    command: 'InsertOrderedList', icon: 'format_list_numbered',
    activeFunction: _isBlockStyledFromParent, toggleFunction: _toggleStyle},
  outdent: {
    command: 'Outdent', icon: 'format_indent_decrease',
    activeFunction: _alwaysFalse, toggleFunction: _toggleStyle},
  indent: {
    command: 'Indent', icon: 'format_indent_increase',
    activeFunction: _alwaysFalse, toggleFunction: _toggleStyle},
  clear_format: {
    command: 'RemoveFormat', icon: 'format_clear',
    activeFunction: _alwaysFalse, toggleFunction: _toggleStyle},
  H1: {
    blockCommand: 'h1', label: 'H1', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  H2: {
    blockCommand: 'h2', label: 'H2', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  H3: {
    blockCommand: 'h3', label: 'H3', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  blockquote: {
    blockCommand: 'blockquote', icon: 'format_quote',
    activeFunction: _isBlockStyledFromParent,
    toggleFunction: _toggleBlockStyle},
  PRE: {
    blockCommand: 'pre', icon: 'space_bar', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  code: {
    blockCommand: 'isotope_code', icon: 'code',
    activeFunction: ({node}) => node.tagName === 'PRE' && node.className === 'code',
    toggleFunction: _toggleBlockStyle},
  link: {
    icon: 'link',
    activeFunction: _isBlockLink,
    toggleFunction: _editLink},
  unlink: {
    command: 'unlink', icon: 'link_off',
    activeFunction: _alwaysFalse,
    toggleFunction: _toggleStyle}
};

export default editorButtons;
