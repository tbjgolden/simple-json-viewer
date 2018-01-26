/* global window, document, HTMLElement */

(() => {
  const colors = ['#999', '#090', '#c00', '#c0c', '#00c', '#ccc', '#333', '#ff0', '#eee'];

  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('STYLE');
    style.innerHTML = (
      '@import url("https://fonts.googleapis.com/css?family=Fira+Mono");' +
      '.json-viewer-container {' +
        'display: flex;' +
        'flex-direction: column;' +
      '}' +
      '.json-viewer-container * {' +
        'white-space: pre;' +
        'font-family: "Fira Mono", monospace;' +
        'font-size: 14px;' +
        'line-height: 16px;' +
        'letter-spacing: 0;' +
        'box-sizing: border-box;' +
      '}' +
      '.json-viewer-search {' +
        'display: block;' +
        'border: 1px solid ' + colors[5] + ';' +
        'border-bottom-width: 0;' +
        'padding: 2.5ex;' +
      '}' +
      '.json-viewer {' +
        'display: block;' +
        'border: 1px solid ' + colors[5] + ';' +
        'padding: 2.5ex;' +
        'user-select: none;' +
        'overflow: auto;' +
      '}' +
      '.json-viewer-object:before {' +
        'content: "{";' +
      '}' +
      '.json-viewer-object:after {' +
        'content: "}";' +
      '}' +
      '.json-viewer-array:before {' +
        'content: "[";' +
      '}' +
      '.json-viewer-array:after {' +
        'content: "]";' +
      '}' +
      '.json-viewer-string:before {' +
        'content: \'"\';' +
      '}' +
      '.json-viewer-string:after {' +
        'content: \'"\';' +
      '}' +
      '.json-viewer-object-value:before {' +
        'content: ": ";' +
      '}' +
      '.json-viewer-array-value:not(:last-child):after {' +
        'content: ",\\A";' +
      '}' +
      '.json-viewer-key-value-pair:not(:last-child):after {' +
        'content: ",\\A";' +
      '}' +
      '.json-viewer-array-contents,' +
      '.json-viewer-object-contents {' +
        'display: block;' +
        'padding-left: 3ex;' +
      '}' +
      '.json-viewer-toggle {' +
        'border: 0;' +
        'padding: 0 .4ex;' +
        'margin: 0;' +
        'outline: 0;' +
        'background: none;' +
      '}' +
      '.json-viewer-toggle:focus {' +
        'background-color: ' + colors[8] + ';' +
      '}' +
      '.json-viewer-object .json-viewer-toggle:before,' +
      '.json-viewer-array .json-viewer-toggle:before {' +
        'content: "><";' +
        'font-size: 1.8ex;' +
        'color: ' + colors[5] + ';' +
      '}' +
      '.json-viewer-object .json-viewer-toggle:hover:before,' +
      '.json-viewer-array .json-viewer-toggle:hover:before {' +
        'cursor: pointer;' +
        'color: ' + colors[6] + ';' +
      '}' +
      '.json-viewer-object.json-viewer-closed .json-viewer-toggle:before,' +
      '.json-viewer-array.json-viewer-closed .json-viewer-toggle:before {' +
        'content: "<>";' +
      '}' +
      '.json-viewer-object.json-viewer-closed .json-viewer-object-contents,' +
      '.json-viewer-array.json-viewer-closed .json-viewer-array-contents {' +
        'display: none;' +
      '}' +
      '.json-viewer-match {' +
        'background-color: ' + colors[7] + ';' +
      '}' +
      '.json-viewer-array-contents {' +
        'counter-reset: index -1;' +
      '}' +
      '.json-viewer-array-value {' +
        'counter-increment: index;' +
        'position: relative;' +
      '}' +
      '.json-viewer-searching .json-viewer-array-value:before,' +
      '.json-viewer-array-value:hover:before {' +
        'content: counter(index);' +
        'position: absolute;' +
        'display: inline-block;' +
        'top: .1ex;' +
        'left: 0;' +
        'transform: translate3d(calc(-100% - .5ex), 0, 0);' +
        'color: ' + colors[5] + ';' +
      '}' +
      '.json-viewer .json-viewer-array-value:hover:before {' +
        'color: ' + colors[3] + ';' +
      '}' +
      '.json-viewer :before, .json-viewer :after {' +
        'color: ' + colors[0] + ';' +
        'font: inherit;' +
        'line-height: inherit;' +
      '}' +
      '.json-viewer-object-key {' +
        'color: ' + colors[1] + ';' +
      '}' +
      '.json-viewer-boolean {' +
        'color: ' + colors[2] + ';' +
      '}' +
      '.json-viewer-number {' +
        'color: ' + colors[3] + ';' +
      '}' +
      '.json-viewer-string {' +
        'color: ' + colors[4] + ';' +
      '}'
    );
    document.head.appendChild(style);
  });

  window.createJSONViewer = (el, json = '{}') => {
    if (!isElement(el)) {
      throw Error('createJSONViewer must be called with a HTML element');
    } else if (!['string', 'object'].includes(typeof json)) {
      throw Error('json parameter passed to createJSONViewer is not a string or object');
    }

    if (typeof json !== 'string') json = JSON.stringify(json);

    return new JSONViewer(el, json);
  };

  class JSONViewer {
    constructor (el, json) {
      const jsonViewer = document.createElement('DIV');
      jsonViewer.classList.add('json-viewer');

      const search = document.createElement('INPUT');
      search.setAttribute('placeholder', 'Search');
      search.classList.add('json-viewer-search');
      search.addEventListener('keyup', this.searchInputKeyUp.bind(this));

      el.classList.add('json-viewer-container');

      this.container = el;
      this.el = jsonViewer;
      this.searchEl = search;
      this.searchValue = '';
      this.json = json;

      this.container.appendChild(search);
      this.container.appendChild(jsonViewer);
      this.generate();
    }

    generate () {
      const html = htmlify(JSON.parse(this.json)) || '';
      this.el.innerHTML = html;
      this.el.querySelectorAll('.json-viewer-toggle').forEach(toggle => {
        toggle.addEventListener('click', e => {
          e.target.parentNode.classList.toggle('json-viewer-closed');
        });
      });
      this.allNodes = allDescendents(this.el);
    }

    searchInputKeyUp () {
      const newValue = this.searchEl.value;
      const prevValue = this.searchValue;
      if (newValue !== prevValue) {
        if (newValue) {
          this.el.classList.add('json-viewer-searching');
          this.search(newValue);
        } else {
          this.el.classList.remove('json-viewer-searching');
          this.allNodes.forEach(n => {
            if (n.nodeType === 1) {
              return (
                n.classList.contains('json-viewer-collection') &&
                n.classList.remove('json-viewer-closed')
              );
            }
            n.parentNode.classList.remove('json-viewer-match');
          });
        }
      }
      this.searchValue = newValue;
    }

    search (query) {
      clearTimeout(this.debounce);

      let regex = null;
      try {
        if (!/\/[^/]*\/[\s\S]*/.test(query)) throw new Error();
        const [ string, flags ] = (frags =>
          [frags[0] ? null : frags.slice(1, frags.length - 1).join('/'), frags[frags.length - 1]]
        )(query.split('/'));
        regex = new RegExp(string, flags);
      } catch (e) {
        regex = null;
      }
      this.searchEl.style.color = regex ? colors[4] : colors[6];

      this.debounce = setTimeout(() => {
        this.allNodes.forEach(n => {
          if (n.nodeType === 1) {
            return (
              n.classList.contains('json-viewer-collection') &&
              n.classList.add('json-viewer-closed')
            );
          }

          if (isMatch(regex || query, n.textContent)) {
            n.parentNode.classList.add('json-viewer-match');
            let curr = getContainingCollectionEl(n);
            while (curr) {
              curr.classList.remove('json-viewer-closed');
              curr = getContainingCollectionEl(curr);
            }
          } else {
            n.parentNode.classList.remove('json-viewer-match');
          }
        });
      }, 150);
    }
  }

  function allDescendents (node, nodes = []) {
    [...(node.childNodes || [])].forEach(child => {
      if ([1, 3].includes(child.nodeType)) {
        nodes.push(child);
        if (child.nodeType === 1) {
          allDescendents(child, nodes);
        }
      }
    });
    return nodes;
  }

  function getContainingCollectionEl (node) {
    do {
      node = node.parentNode;
      if (!node || node.classList.contains('json-viewer')) return;
    } while (!node.classList.contains('json-viewer-collection'));
    return node;
  }

  function isMatch (query, string) {
    if (query instanceof RegExp) return query.test(string);
    if (!query || !string) return false;
    query = query.toLowerCase();
    string = string.toLowerCase();
    let qi = 0;
    let si = 0;
    while (true) {
      if (qi === query.length) return true;
      if (si === string.length) return false;
      if (query.charCodeAt(qi) === string.charCodeAt(si)) qi++;
      si++;
    }
  }

  function htmlify (variable) {
    const type = getType(variable);
    switch (type) {
      case 'number': case 'boolean':
        return '<span class="json-viewer-' + type + '">' + variable + '</span>';
      case 'string':
        return (
          '<span class="json-viewer-string">' +
            escapeString(variable) +
          '</span>'
        );
      case 'array':
        return (
          '<span class="json-viewer-array json-viewer-collection">' +
            '<button class="json-viewer-toggle"></button>' +
            '<span class="json-viewer-array-contents">' +
              variable.map(variable => (
                '<span class="json-viewer-array-value">' + htmlify(variable) + '</span>'
              )).join('') +
            '</span>' +
          '</span>'
        );
      case 'object':
        return (
          '<span class="json-viewer-object json-viewer-collection">' +
            '<button class="json-viewer-toggle"></button>' +
            '<span class="json-viewer-object-contents">' +
              Object.keys(variable).map(key =>
                '<span class="json-viewer-key-value-pair">' +
                  '<span class="json-viewer-object-key">' +
                    escapeString(key) +
                  '</span>' +
                  '<span class="json-viewer-object-value">' +
                    htmlify(variable[key]) +
                  '</span>' +
                '</span>'
              ).join('') +
            '</span>' +
          '</span>'
        );
    }
  }

  function escapeString (str) {
    str = JSON.stringify(str);
    return str.substring(1, str.length - 1);
  }

  function getType (variable) {
    const type = typeof variable;
    if (type === 'object') return Array.isArray(variable) ? 'array' : 'object';
    return type;
  }

  function isElement (o) {
    return (
      typeof HTMLElement === 'object'
        ? o instanceof HTMLElement
        : (
          o &&
          typeof o === 'object' &&
          o !== null &&
          o.nodeType === 1 &&
          typeof o.nodeName === 'string'
        )
    );
  }
})();
