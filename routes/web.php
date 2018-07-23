<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/



Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::get('/', 'HomeController@index');

/**
 * Backglog
 */
Route::get('/backglog', 'BackglogController@index');

/**
 * Projects
 */

Route::get('/projects','ProjectController@index');

Route::get('/projects/create','ProjectController@create');
Route::post('/projects/create','ProjectController@store');

/**
 * Stories
 */

Route::get('/stories/create','StoriesController@create');
Route::post('/stories/create','StoriesController@store');

/**
 * Settings
 */
Route::get('/settings','SettingsController@index');
Route::get('/settings/storyStates/create','SettingsController@storyStatesCreate');
Route::post('/settings/storyStates/create','SettingsController@storyStatesStore');
