[![Build Status](https://travis-ci.org/gregpabian/subcommander.svg?branch=master)](https://travis-ci.org/gregpabian/subcommander)

# subcommander

Command-line argument parser for Node.js with sub-command support.

Subcommander allows to define multiple levels of sub-commands with options in a single script.
Sub-commands inherit its parent's options and default values.

Additionally a nicely-formatted usage message is generated and available when `-h` or `--help` flag is given.

## Installation

```
npm install subcommander
```

## Usage

```javascript
var sc = require('subcommander');

var parsed = sc.parse();
// returns and object containing parsed arguments
```

## API

Subcommander API is chainable which means you can do the following:

```javascript
var sc = require('subcommander');

sc
  .command('foo', {
    desc: 'description for foo',
    callback: function () {}
  })
    .option('bar', {
      abbr: 'b',
      desc: 'description for bar'
    })
    .option('baz', {
      abbr: 'B',
      desc: 'description for baz'
    })
  .end()
  .command('quux', {
    desc: 'description for quux',
    callback: function () {}
  });
 
sc.parse();
```

This will create a CLI with two commands: `foo` and `quux`.

Additionally, `foo` command will accept `--bar` and `--baz` options.

### `option(name, props)`

Add new option.

**Parameters**

- **name**: String, Option's name

- **props**: Object, Option's properties

  - **prop.abbr**: String, Option's abbreviation

  - **prop.desc**: String, Option's description

  - **prop.valueName**: String, Name of the option's value displayed in the usage message

  - **prop.flag**: Boolean, Define if option is a flag

  - **prop.default**: *, Default value for the option

### `command(name, props)`

Add new (sub-)command.

**Parameters**

- **name**: String, Command's name

- **props**: Object, Command's properties

  - **props.desc**: String, Command's description

  - **props.callback**: String, Command's callback function executed if the command is run

**Returns**: New (sub-)command instance

### `parse(argv)`

Parse the command line arguments

**Parameters**

- **argv**: Array.<String> Array of arguments *Optional*

**Returns**: List of parsed arguments

### `usage()`

Print command's usage message on the STDOUT.

### `scriptName()`

Set the name of the script's executable.

**Parameters**

- **name**: String, Name of the executable

### `noColors()`

Disable coloring in usage and error messages

### `end()`

End modifying current command and return to the parent

### `reset()`

Resets all properties of the command

## Examples

TODO

## License

(The MIT License)

Copyright (c) 2014 Greg Pabian <greg.pabian@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
