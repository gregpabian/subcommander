/* global describe, it, beforeEach, afterEach */
/*jshint -W030 */

'use strict';

var rewire = require( 'rewire' ),
    mcmd = rewire( '../' ),
    expect = require( 'chai' ).expect;

describe( 'mcmd', function () {
    var oldExit,
        oldWrite,
        oldWriteLine,
        output,
        code;

    beforeEach( function () {
        oldExit = process.exit;
        oldWrite = mcmd.__get__( 'write' );
        oldWriteLine = mcmd.__get__( 'writeLine' );
        output = '',
        code;

        process.exit = function ( c ) {
            code = c;
        };

        mcmd.__set__( 'write', function ( text ) {
            output += text;
        } );

        mcmd.__set__( 'writeLine', function ( text ) {
            output += text;
        } );
    } );

    afterEach( function () {
        process.exit = oldExit;
        mcmd.__set__( 'write', oldWrite );
        mcmd.__set__( 'writeLine', oldWriteLine );

        mcmd.reset();
    } );

    it( 'should expose its public API', function () {
        expect( mcmd ).to.be.instanceof( mcmd.Command );
        expect( Object.getPrototypeOf( mcmd ) ).to.contain.keys(
            [ 'option', 'command', 'parse', 'usage', 'scriptName', 'noColors', 'end' ]
        );
    } );

    it( 'should parse unknown -x option as a flag', function () {
        expect( mcmd.parse( [ '-f' ] ) ).to.deep.equal( {
            f: true
        } );
    } );

    it( 'should parse undefined --xxx option as a flag', function () {
        expect( mcmd.parse( [ '--foo' ] ) ).to.deep.equal( {
            foo: true
        } );
    } );

    it( 'should parse undefined -x option and its value', function () {
        expect( mcmd.parse( [ '-f', 'bar' ] ) ).to.deep.equal( {
            f: 'bar'
        } );
    } );

    it( 'should parse undefined --xxx option and its value', function () {
        expect( mcmd.parse( [ '--foo', 'bar' ] ) ).to.deep.equal( {
            foo: 'bar'
        } );
    } );

    it( 'should parse undefined -x=yyy option and its value', function () {
        expect( mcmd.parse( [ '-f=bar' ] ) ).to.deep.equal( {
            f: 'bar'
        } );
    } );

    it( 'should parse undefined --xxx=yyy option and its value', function () {
        expect( mcmd.parse( [ '--foo=bar' ] ) ).to.deep.equal( {
            foo: 'bar'
        } );
    } );

    it( 'should add unrecognized arguments to the output', function () {
        expect( mcmd.parse( [ '--foo=foo', 'bar', '-f', 'quux', 'baz' ] ) ).to.deep.equal( {
            foo: 'foo',
            f: 'quux',
            '0': 'bar',
            '1': 'baz'
        } );
    } );

    it( 'should define an option', function () {
        var expected = {
            foo: 'bar'
        };

        function redefine() {
            return mcmd.reset().option( 'foo', {
                abbr: 'f',
                desc: 'desc for foo'
            } );
        }

        redefine();

        expect( mcmd.options ).to.have.key( 'foo' );
        expect( mcmd.options.foo ).to.be.instanceof( mcmd.Option );
        expect( mcmd.parse( [ '-f', 'bar' ] ) ).to.deep.equal( expected );
        expect( redefine().parse( [ '--foo', 'bar' ] ) ).to.deep.equal( expected );
        expect( redefine().parse( [ '-f=bar' ] ) ).to.deep.equal( expected );
        expect( redefine().parse( [ '--foo=bar' ] ) ).to.deep.equal( expected );
    } );

    describe( 'option', function () {
        it( 'should handle a flag', function () {
            var expected = {
                foo: true,
                '0': 'bar'
            };

            expect(
                mcmd.option( 'foo', {
                    abbr: 'f',
                    flag: true,
                    desc: 'desc for foo flag'
                } ).parse( [ '-f', 'bar' ] )
            ).to.deep.equal( expected );

            expect(
                mcmd.reset().option( 'foo', {
                    abbr: 'f',
                    flag: true,
                    desc: 'desc for foo flag'
                } ).parse( [ '--foo', 'bar' ] )
            ).to.deep.equal( expected );
        } );

        it( 'should return a default value', function () {
            var expected = {
                foo: 'baz',
                '0': 'bar'
            };

            mcmd.option( 'foo', {
                abbr: 'f',
                desc: 'desc for foo',
                default: 'baz'
            } );

            expect( mcmd.parse( [ 'bar' ] ) ).to.deep.equal( expected );
        } );

        it( 'should override a default value', function () {
            var expected = {
                foo: 'quux',
                '0': 'bar'
            };

            mcmd.option( 'foo', {
                abbr: 'f',
                desc: 'desc for foo',
                default: 'baz'
            } );

            expect( mcmd.parse( [ 'bar', '--foo', 'quux' ] ) ).to.deep.equal( expected );
        } );

        it( 'should return a pre-formatted usage information', function () {
            var expected = {
                name: '-f value, --foo value',
                desc: 'desc for foo [bar]'
            };

            mcmd.option( 'foo', {
                abbr: 'f',
                desc: 'desc for foo',
                default: 'bar',
                valueName: 'value'
            } );

            expect( mcmd.options.foo.getUsage() ).to.deep.equal( expected );
        } );
    } );

    it( 'should define a command', function () {
        mcmd.command( 'foo', {
            desc: 'desc for foo',
            callback: function () {}
        } );

        expect( mcmd.commands ).to.have.key( 'foo' );
        expect( mcmd.commands.foo ).to.be.instanceof( mcmd.Command );
    } );

    it( 'should report an error if no command was given', function () {
        mcmd.command( 'foo', {
            desc: 'desc for foo',
            callback: function () {}
        } );

        mcmd.parse( [ '--bar', 'baz' ] );

        expect( code ).to.equal( 1 );
        expect( output ).to.equal(
            '\u001b[31m\u001b[1mError: \u001b[22mMissing command for \"null\".' +
            '\u001b[39m\u001b[1m\nUsage:\u001b[22m \u001b[33m <command>\u001b[39m\n\u001b[1m\u001b[3' +
            '3mCommands:\n\u001b[39m\u001b[22m  foo  \u001b[90mdesc for foo\u001b[39m\n\n'
        );
    } );

    describe( 'command', function () {
        it( 'should execute its callback with parsed arguments', function ( done ) {
            mcmd.command( 'foo', {
                desc: 'desc for foo',
                callback: function ( parsed ) {
                    expect( parsed ).to.deep.equal( {
                        bar: 'baz',
                        '0': 'quux'
                    } );

                    done();
                }
            } );

            mcmd.parse( [ 'foo', '--bar', 'baz', 'quux' ] );
        } );

        it( 'should define a sub-command', function () {
            var foo = mcmd.command( 'foo', {
                    desc: 'desc for foo',
                    callback: function () {}
                } ),
                bar = foo.command( 'bar', {
                    desc: 'desc for bar',
                    callback: function () {}
                } );

            expect( mcmd.commands ).to.have.key( 'foo' );
            expect( mcmd.commands.foo ).to.equal( foo );

            expect( mcmd.commands.foo.commands ).to.have.key( 'bar' );
            expect( mcmd.commands.foo.commands.bar ).to.equal( bar );
        } );

    } );

    describe( 'sub-command', function () {
        it( 'should execute its callback with parsed arguments', function ( done ) {
            mcmd
                .command( 'foo', {
                    desc: 'desc for foo',
                    callback: function () {}
                } )
                .command( 'bar', {
                    desc: 'desc for bar',
                    callback: function ( parsed ) {
                        expect( parsed ).to.deep.equal( {
                            'baz': 'quux'
                        } );

                        done();
                    }
                } );

            mcmd.parse( [ 'foo', 'bar', '--baz', 'quux' ] );
        } );

        it( 'should return its parent using end() method', function () {
            mcmd
                .command( 'foo', {
                    desc: 'desc for foo',
                    callback: function () {}
                } )
                .end()
                .command( 'bar', {
                    desc: 'desc for bar',
                    callback: function () {}
                } );

            expect( mcmd.commands ).to.have.keys( [ 'foo', 'bar' ] );
            expect( mcmd.commands.foo.commands ).to.be.empty;
        } );

        it( 'should inherit its parent\'s options and its default values', function ( done ) {
            mcmd
                .command( 'foo', {
                    desc: 'desc for foo',
                    callback: function () {}
                } )
                .option( 'baz', {
                    abbr: 'b',
                    desc: 'desc for baz',
                    default: 'quux'
                } )
                .command( 'bar', {
                    desc: 'desc for bar',
                    callback: function ( parsed ) {
                        expect( parsed ).to.deep.equal( {
                            'baz': 'quux',
                            'quux': 'quax'
                        } );

                        done();
                    }
                } )
                .option( 'quux', {
                    abbr: 'q',
                    desc: 'desc for quux'
                } );

            mcmd.parse( [ 'foo', 'bar', '--quux', 'quax' ] );
        } );
    } );

    it( 'should print usage information', function () {
        mcmd
            .option( 'baz', {
                abbr: 'b',
                desc: 'desc for baz',
                valueName: 'value',
                default: 'quux'
            } )
            .option( 'quux', {
                abbr: 'q',
                desc: 'desc for quux',
                flag: true
            } )
            .command( 'foo', {
                desc: 'desc for foo',
                callback: function () {}
            } )
            .end()
            .command( 'bar', {
                desc: 'desc for bar',
                callback: function () {}
            } );

        mcmd.usage();

        expect( code ).to.equal( 1 );
        expect( output ).to.equal(
            '\u001b[1m\nUsage:\u001b[22m \u001b[33m <command>\u001b[39m\u001b[36m [options]\u001b[39m\n' +
            '\u001b[1m\u001b[33mCommands:\n\u001b[39m\u001b[22m  bar  \u001b[90mdesc for bar\u001b[39m\n' +
            '  foo  \u001b[90mdesc for foo\u001b[39m\n\u001b[1m\u001b[36mOptions:\n' +
            '\u001b[39m\u001b[22m  -b value, --baz value  \u001b[90mdesc for baz [quux]\u001b[39m\n' +
            '  -q, --quux             \u001b[90mdesc for quux\u001b[39m\n\n'
        );
    } );
} );
