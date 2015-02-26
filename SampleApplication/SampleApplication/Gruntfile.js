module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    port: 3000,

    connect: {
      server: {
        options: {
          port: '<%= port %>',
          base: './app'
        }
      }
    },
    tsd: {
        refresh: {
            options: {
                // execute a command
                command: 'reinstall',

                //optional: always get from HEAD
                latest: true,

                // specify config file
                config: 'tsd.json',

                // experimental: options to pass to tsd.API
                opts: {
                    // props from tsd.Options
                }
            }
        }
    },
    ts: {
      default: {
        src: ['app/**/*.ts', '!app/bower_components/**/*.ts'],
        out: 'app/app.js',
        reference: 'app/_references.ts',
        options: {
          target: 'es5',
          sourceMap: true
        }
      }
    },
    watch: {
      files: ['Gruntfile.js', 'app/**/*.ts', 'app/**/*.html'],
      tasks: ['ts']
    },
    open: {
      dev: {
        path: 'http://localhost:<%= port %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-tsd');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('default', ['ts']);
  
  grunt.registerTask('serve', [
    'ts',
    'connect', 
    'open', 
    'watch'
  ]);

}; 