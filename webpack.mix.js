let mix = require('laravel-mix');
let webpack = require('webpack');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.webpackConfig({
	plugins: [
		new webpack.ProvidePlugin({
			'$': 'jquery',
			'jQuery': 'jquery',
			'window.jQuery': 'jquery',
		}),
	]
});

mix.babel([
	'resources/assets/js/core/jquery.min.js',
	'resources/assets/js/core/popper.min.js',
	'resources/assets/js/plugins/bootstrap-notify.js',
	'resources/assets/js/plugins/chartist.min.js',
	'resources/assets/js/plugins/perfect-scrollbar.jquery.min.js',
	'resources/assets/js/material-dashboard.js',
	'resources/assets/js/core/bootstrap-material-design.min.js'
],'public/js/core.js');


mix.sass('resources/assets/scss/app.scss', 'public/css');
