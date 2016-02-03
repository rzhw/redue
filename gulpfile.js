// gulpfile.js
// Derived from angular/angular@6acc99729c7b3f1ffa480fb7e5b585754f197e17
//
// The MIT License
//
// Copyright (c) 2014-2016 Google, Inc. http://angular.io
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var gulp = require('gulp');

// // THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// // This is to ensure that we catch env issues before we error while requiring other dependencies.
// require('./tools/check-environment')(
//     {requiredNpmVersion: '>=3.5.3 <4.0.0', requiredNodeVersion: '>=5.4.1 <6.0.0'});

// ------------
// formatting

function doCheckFormat() {
  var clangFormat = require('clang-format');
  var gulpFormat = require('gulp-clang-format');

  return gulp.src(['app/**/*.ts', '!**/typings/**/*.d.ts', 'gulpfile.js'])
      .pipe(gulpFormat.checkFormat('file', clangFormat));
}

gulp.task('check-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("NOTE: this will be promoted to an ERROR in the continuous build");
  });
});

gulp.task('enforce-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("ERROR: You forgot to run clang-format on your change.");
    console.log("See https://github.com/angular/angular/blob/master/DEVELOPER.md#clang-format");
    process.exit(1);
  });
});

// gulp.task('lint', ['build.tools'], function() {
//   var tslint = require('gulp-tslint');
//   // Built-in rules are at
//   // https://github.com/palantir/tslint#supported-rules
//   var tslintConfig = {
//     "rules": {
//       "requireInternalWithUnderscore": true,
//       "requireParameterType": true,
//       "requireReturnType": true,
//       "semicolon": true,
//
//       // TODO: find a way to just screen for reserved names
//       "variable-name": false
//     }
//   };
//   return gulp.src(['modules/angular2/src/**/*.ts', '!modules/angular2/src/testing/**'])
//       .pipe(tslint({
//         tslint: require('tslint').default,
//         configuration: tslintConfig,
//         rulesDirectory: 'dist/tools/tslint'
//       }))
//       .pipe(tslint.report('prose', {emitError: true}));
// });
