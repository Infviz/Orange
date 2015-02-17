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
    ts: {
      default: {
        src: ['app/**/*.ts'],
        out: 'app/app.js',
        reference: 'app/_references.ts',
        options: {
          target: 'es5',
          sourceMap: true
        }
      }
    },
    watch: {
      files: ['Gruntfile.js', 'app/**/*.ts'],
      tasks: ['ts']
    },
    open: {
      dev: {
        path: 'http://localhost:<%= port %>'
      }
    }
  });

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