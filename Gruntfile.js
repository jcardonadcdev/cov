module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    clean: {
      build: {
        src: ['dist']
      }
    },
    ts: {
      build: {
        tsconfig: './tsconfig.json'
      }
    },
    sass: {
      options: {
        implementation: require('node-sass'),
        sourceMap: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.scss'],
          dest: 'dist',
          ext: '.css'
        }]
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.css', 'put.js'],
          dest: 'dist'
        }]
      }
    }
  });
  grunt.registerTask('default', ['clean:build', 'ts:build', 'sass:build', 'copy:build']);
};
