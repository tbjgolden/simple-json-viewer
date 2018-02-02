/* global window, document, HTMLElement */

(() => {
  const defaultOptions = {
    colors: ['#999', '#090', '#c00', '#c0c', '#00c', '#ccc', '#333', '#ff0', '#eee'],
    fontFamily: 'monospace'
  };

  document.addEventListener('DOMContentLoaded', addBaseStyles);

  window.createJSONViewer = (el, json = {}, opts = {}) => {
    if (!isElement(el)) {
      throw Error('createJSONViewer must be called with a HTML element');
    } else if (!['string', 'object'].includes(typeof json)) {
      throw Error('json parameter passed to createJSONViewer is not a string or object');
    } else if (typeof opts !== 'object') {
      throw Error('options parameter passed to createJSONViewer is not an object');
    }

    if (typeof json !== 'string') json = JSON.stringify(json);

    return new JSONViewer(el, json, { ...defaultOptions, ...opts });
  };

  class JSONViewer {
    constructor (el, json, opts) {
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
      this.opts = opts;

      this.container.appendChild(search);
      this.container.appendChild(jsonViewer);

      this.uid = `time-${Date.now()}`;
      el.classList.add(this.uid);

      this.generate();
    }

    generate () {
      addCustomStyles(this.uid, this.opts);
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
      this.searchEl.style.color = regex ? this.opts.colors[4] : this.opts.colors[6];

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

  function addBaseStyles () {
    const style = document.createElement('STYLE');
    style.innerHTML = '$$$COMPILED:INDEX.SCSS$$$';
    document.head.appendChild(style);
  }

  function addCustomStyles (uid, opts) {
    const style = document.createElement('STYLE');
    style.innerHTML = '$$$COMPILED:DEFAULT.SCSS$$$'
      .replace(/\[timestamp\]/g, `.${uid}`)
      .replace(/([0-9])vmax/g, (_, colorId) => {
        return opts.colors[~~colorId];
      })
      .replace('monospace', opts.fontFamily);
    document.head.appendChild(style);
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
