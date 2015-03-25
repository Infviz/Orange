/// <vs BeforeBuild='vs' />
'use strict'

/*
- fixa .gitignore
- livereload/watch task
- dist task
*/

module.exports = function (grunt) {
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var conf = {
        app: 'app',
        dist: 'dist',
        styles: 'app/styles',
        port: '3000'
    }

    // Project configuration.
    grunt.initConfig({
        conf: conf,

        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            ts: {
                files: ['<%= conf.app %>/**/*.ts', '!<%= conf.app %>/bower_components/**'],
                tasks: ['ts'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= conf.styles %>/**/*.css'] // maybe we should do less-compile?
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= conf.app %>/**/*.html',

                ]
            }
        },

        connect: {
            options: {
                port: '<%= conf.port %>',
                open: true,
                livereload: 35729,
                hostname: 'localhost',
                directory: '<%= conf.app %>'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            connect.static(conf.app)
                        ];
                    }
                }
            }
        },
        tsd: {
            refresh: {
                options: {
                    command: 'reinstall',
                    latest: true,
                    config: 'tsd.json'
                }
            }
        },
        ts: {
            default: {
                src: ['<%= conf.app %>/**/*.ts', '!<%= conf.app%>/bower_components/**'],
                out: 'app/app.js',
                reference: 'app/_references.ts',
                options: {
                    target: 'es5',
                    sourceMap: true
                }
            }
        },

        // Automatically inject Bower components into the HTML file
        wiredep: {
            app: {
                ignorePath: /^\/|\.\.\//,
                src: ['<%= conf.app %>/index.html'],
                exclude: ['bower_components/bootstrap/dist/js/bootstrap.js']
            }
        }
    });

    grunt.registerTask('default', [
        'tsd',
        'ts'
    ]);

    grunt.registerTask('vs', [
      'ts',
      'wiredep'
    ]);

    grunt.registerTask('serve', [
      'ts',
      'wiredep',
      'connect:livereload',
      'watch'
    ]);

};