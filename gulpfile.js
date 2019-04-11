const gulp = require('gulp')
const path = require('path')
const ts = require('gulp-typescript')
const replace = require('gulp-replace')
const sourcemaps = require('gulp-sourcemaps')
const gzip = require('gulp-gzip')
const merge2 = require('merge2')

const rollup = require('rollup')
const rollupResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const uglify = require('rollup-plugin-uglify')
const json = require('rollup-plugin-json')

const version = require('./package.json').version

function postProcess() {
  return gulp
    .src(
      [
        path.resolve(__dirname, 'dist/**/*.js'),
        path.resolve(__dirname, 'bundles/*.js'),
      ],
      { base: '.' }
    )
    .pipe(replace('${SDK_VERSION}', version))
    .pipe(gulp.dest('.'))
}

const buildModule = gulp.series(
  gulp.parallel([
    function buildCjs() {
      const tsProject = ts.createProject(
        path.resolve(__dirname, 'config/tsconfig.build.json'),
        {
          module: 'commonjs',
        }
      )
      const tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())

      const jsPipe = tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/cjs'))
      const dtsPipe = tsResult.dts.pipe(gulp.dest('dist/cjs'))

      return merge2([jsPipe, dtsPipe])
    },
    function buildEsm() {
      const tsProject = ts.createProject(
        path.resolve(__dirname, 'config/tsconfig.build.json')
      )
      const tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())

      const jsPipe = tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/esm'))
      const dtsPipe = tsResult.dts.pipe(gulp.dest('dist/esm'))

      return merge2([jsPipe, dtsPipe])
    },
  ]),
  async function buildIief() {
    const bundle = await rollup.rollup({
      input: `./dist/esm/index.js`,
      plugins: [
        rollupResolve({
          browser: true,
        }),
        commonjs(),
        json(),
        uglify.uglify({
          output: {
            comments: 'some',
          },
        }),
      ],
    })

    return bundle.write({
      file: `./bundles/scorocode.js`,
      format: 'iife',
      name: 'scorocode',
      sourcemap: true,
      banner: `/** @preserve Scorocode JS SDK v${version} */`,
    })
  },
  function makeGz() {
    return gulp
      .src('./bundles/*.js')
      .pipe(gzip())
      .pipe(gulp.dest('./bundles/'))
  },
  postProcess
)

gulp.task('build', buildModule)

const watcher = () => {
  gulp.watch(['src/**/*.ts'], buildModule)
}

gulp.task('dev', gulp.parallel(watcher))
