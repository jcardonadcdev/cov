module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    clean: {
      build: {
        src: ['dist']
      },
      dev: {
        src: ['dev/cov']
      }
    },
    ts: {
      build: {
        tsconfig: './tsconfig.json'
      },
      dev: {
        tsconfig: './tsconfig.dev.json'
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
      },
      dev: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.scss'],
          dest: 'dev/cov',
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
      },
      dev: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.css', 'put.js'],
          dest: 'dev/cov'
        }]
      }
    },
    connect: {
      dev: {
        options: {
          port: 8000,
          base: './dev/',
          hostname: '*',
          protocol: 'https'
        }
      }
    },
    watch: {
      dev: {
        files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.scss', 'src/**/*.js'],
        tasks: ['clean:dev', 'ts:dev', 'sass:dev', 'copy:dev']
      }
    },
  });
  grunt.registerTask('default', ['clean:build', 'ts:build', 'sass:build', 'copy:build']);
  grunt.registerTask('dev', ['clean:dev', 'ts:dev', 'sass:dev', 'copy:dev', 'connect', 'watch']);
};
