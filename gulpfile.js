const gulp = require('gulp'),
	tsc = require('gulp-typescript'),
	peg = require('gulp-peg'),
	merge = require('merge2');

const project = tsc.createProject('tsconfig.json', {
	declaration: true
});

gulp.task('typescript', ['grammar'], () => {
	var tsResult = gulp.src('src/*.ts')
		.pipe(project());

	return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
		tsResult.dts.pipe(gulp.dest('lib')),
		tsResult.js.pipe(gulp.dest('lib'))
	]);
})

gulp.task('grammar', () => {

	return merge([
		gulp.src('./grammar/models.pegjs')
		.pipe(peg())
		.pipe(gulp.dest('src')),
		gulp.src('./grammar/models.pegjs')
		.pipe(peg())
		.pipe(gulp.dest('lib'))

	])
});


gulp.task('default', ['typescript'])