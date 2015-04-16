/// <vs BeforeBuild='vs' />
'use strict'

/*
- fixa .gitignore
- livereload/watch task
- dist task
*/

var path = require('path');

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
    		imports: {
				files: ['<%= conf.app %>/Controls/**/*.less'],
    			tasks: ['injector:lessimports', 'less'],
			},
    		styles: {
				files: ['<%= conf.styles %>/**/*.less'],
				tasks: ['less'],
    			options: {
    				livereload: true
    			}	
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

    	injector: {
    		lessimports : {
    			options: {
    				starttag: '/* injector:less */',
    				endtag: '/* endinjector */',
    				transform: function(filepath, index, length) {

    					var styleDir = grunt.config.get('conf').styles;

    					if (!styleDir)
    						throw "No 'styles' folder have been specified in 'conf'."; 

    					var p = path.relative(
    						path.join(process.cwd(), styleDir),
    						path.join(process.cwd(), path.dirname(filepath)));

    					return '@import "' + p + "/" + path.basename(filepath, '.less') + '";';
    				}
    			},
    			files : { 
    				'<%= conf.styles %>/main.less' : [
    				'<%= conf.app %>/Controls/**/*.less',
                        //'<%= conf.app %>/Views/**/*.less',
                        ]
                      }
                    }
                  },

                  less: {
                  	default: {
                  		options: {
                  			ieCompat: false
                  		},
                  		files: { 
                  			"<%= conf.styles %>/main.css": "<%= conf.styles %>/main.less"
                  		}
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
        		exclude: ['/rxjs/' , '/rxj-dom/']
        	}
        }
      });

grunt.registerTask('default', [
	'tsd',
	'ts',
	'injector:lessimports',
	'less'
	]);

grunt.registerTask('vs', [
	'ts',
	'wiredep'
	]);

grunt.registerTask('serve', [
	'ts',
	'injector:lessimports',
	'less',
	'wiredep',
	'connect:livereload',
	'watch'
	]);

};