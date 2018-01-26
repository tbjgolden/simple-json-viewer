![](https://img.shields.io/npm/v/simple-json-viewer.svg)

# simple-json-viewer

#### The simple, lightweight JSON viewer for the browser that 2018 deserves.

### Features:

- search (with regex support)
- folding
- keyboard-only friendly
- highlighting
- lightweight
- hackable (src/index.js)
- browser support okay (not that I care about IE users any more)
  - Unprefixed flexbox is probably the limiting factor
  - if you care enough there's only 350 lines including CSS, so go for it

### Usage

```
<script src="dist/simple-json-viewer.js"></script>

<div id="json-viewer-container"></div>

<script>
  var container = document.querySelector('#json-viewer-container');

  // var json = '{"jsonArgCanBeJsonString": true}';
  var json = { jsonArgCanBeJsonObject: true };

  createJSONViewer(container, json);
</script>
```

There are no options. `¯\_(ツ)_/¯`

If you want something added, go ahead and add it.

If you want to contribute, create a pull request. :D

Have a nice day.

### Screenshots

![](https://i.imgur.com/MaiIrtD.png)

![](https://i.imgur.com/qvXFpMs.png)

![](https://i.imgur.com/NyG1DbX.png)
