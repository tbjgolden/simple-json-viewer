![](https://img.shields.io/npm/v/simple-json-viewer.svg)

# simple-json-viewer

#### The simple, lightweight JSON viewer for the browser that 2018 deserves.

### Features:

- fuzzy search (with regex support)
- folding
- keyboard-only friendly
- highlighting
- lightweight
- hackable (src/index.js)
- browser support okay (not that I care about IE users any more)
  - Unprefixed flexbox is probably the limiting factor

### Screenshots

![](https://i.imgur.com/MaiIrtD.png)

![](https://i.imgur.com/qvXFpMs.png)

![](https://i.imgur.com/NyG1DbX.png)

### Usage

```html
<script src="dist/simple-json-viewer.js"></script>

<div id="json-viewer-container"></div>

<script>
  var container = document.querySelector('#json-viewer-container');

  // var json = '{"jsonArgCanBeJsonString": true}';
  var json = { jsonArgCanBeJsonObject: true };

  var options = {
    fontFamily: '"Fira Mono", monospace',
    colors: ['gray', '#090', '#c00', 'purple', '#00c', '#ccc', '#333', 'yellow', 'rgb(240,240,240)']
  };

  var viewer = createJSONViewer(container, json, options);

  viewer.changeJSON({ youCanAlsoChangeTheJSON: 'after the viewer is created' });
</script>
```

### `methods`

- `JSONViewer.changeJSON(json<String|Object>, path<Array> {optional, default: []})`  
  ```javascript
  var viewer = createJSONViewer(el, json, opts);

  setTimeout(function () {
    // without path, replaces all of the json
    viewer.changeJSON({ "array": [ { "i-have-been-modified": false } ] });
  }, 1000);

  setTimeout(function () {
    // with path, replaces specific part of the json
    viewer.changeJSON(true, ["array", 0, "i-have-been-modified"]);
  }, 2000);
  ```

### `options`

- `fontFamily` {default: `'monospace'`}  
  If you want to use a custom font (you'll have to load it yourself).
- `colors` {default: `['#999', '#090', '#c00', '#c0c', '#00c', '#ccc', '#333', '#ff0', '#eee']`}  
  An array of 9 CSS colors as strings. To see what each one does, look **[here]()**
  (numbers before `vmax` corresponds to the index, so `color: 3vmax` means `color: #c0c` with defaults)
- `onValueClick` {default: none}  
  onValueClick allows you to pass a handler when a value is clicked. It will be the closest
  ancestor that is either a key-value pair from an object, or an item from an array.
  ```javascript
  var json = {
    "someArray": [
      "clickMe"
    ]
  };

  var viewer = createJSONViewer(el, json, {
    onValueClick: function (valueOfClicked, pathToClicked, element) {
      console.log(valueOfClicked); // "clickMe"
      console.log(pathToClicked);  // ["someArray", 0]
      console.log(element);        // div.json-viewer-array-value
    }
  });
  ```

### Finally

If you want to contribute, create a pull request :D

Also, it's a small library of a few hundred lines, so if it's missing something why not modify it.

:thumbs-up:
