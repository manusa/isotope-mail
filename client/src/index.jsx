import React from 'react';
import ReactDOM from 'react-dom';

const title = 'Hello world!';

ReactDOM.render(
    <div>{title}</div>,
    document.getElementById('app')
);

module.hot.accept();