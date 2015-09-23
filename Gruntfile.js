module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt); // Load all grunt-* packages from package.json
  require('time-grunt')(grunt);       // Display the elapsed execution time of grunt tasks

  grunt.initConfig({

    watch: {
      style: {
        files: ['css/*.css'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      scripts: {
        files: ['js/*.js'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      images: {
        files: ['img/*.{png,jpg,gif,svg}', 'photos/*.{jpg,webp}'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      html: {
        files: ['*.html'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },


    browserSync: {
      dev: {
        bsFiles: {
          src : [
            'css/*.css',
            'js/*.js',
            'img/*.{png,jpg,gif,svg}',
            'photos/*.{jpg,webp}',
            '*.html'
          ]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "./"
          },
          // startPath: "/index.html",
          ghostMode: {
            clicks: true,
            forms: true,
            scroll: false
          }
        }
      }
    }

  });

  grunt.registerTask('default', [
    'browserSync',
    'watch'
  ]);

};
