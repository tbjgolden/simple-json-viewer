#!/usr/bin/env node

const { exec } = require('child_process');
const sass = require('node-sass');
const fs = require('fs');
const path = require('path');

sass.render({
  data: fs.readFileSync(path.join(__dirname, 'src/index.scss'), 'utf8'),
  outputStyle: 'compressed'
}, (err, compiledIndex) => {
  if (err) return console.log(err);

  sass.render({
    data: fs.readFileSync(path.join(__dirname, 'src/default.scss'), 'utf8'),
    outputStyle: 'compressed'
  }, (err, compiledDefault) => {
    if (err) return console.log(err);

    exec(path.join(__dirname, 'node_modules/.bin/webpack'), (err, stdout, stderr) => {
      stdout = stdout.trim();
      stderr = stderr.trim();

      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);

      if (err) return console.log(err);

      const compiledFileContent = fs.readFileSync(path.join(__dirname, 'dist/simple-json-viewer.min.js'), 'utf8')
        .replace(/\$\$\$COMPILED:INDEX\.SCSS\$\$\$/g, `${compiledIndex.css}`.replace(/\'/g, "\\'").replace(/[\r\n]/g, ''));

      const withDefaults = compiledFileContent
        .replace(/\$\$\$COMPILED:DEFAULT.SCSS\$\$\$/g, `${compiledDefault.css}`.replace(/\'/g, "\\'").replace(/[\r\n]/g, ''));

      const withoutDefaults = compiledFileContent
        .replace(/\$\$\$COMPILED:DEFAULT.SCSS\$\$\$/g, '');

      fs.writeFileSync(path.join(__dirname, 'dist/simple-json-viewer.min.js'), withDefaults);
      fs.writeFileSync(path.join(__dirname, 'dist/simple-json-viewer.slim.min.js'), withoutDefaults);
    });

  });
});
