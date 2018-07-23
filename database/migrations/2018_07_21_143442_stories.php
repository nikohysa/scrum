<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Stories extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

	    Schema::create('stories', function(Blueprint $table) {
	    	$table->increments('id');
	    	$table->string('title')->nullable();
	    	$table->integer('project_id')->unsigned()->nullable();
	    	$table->integer('user_id')->unsigned()->nullable();
	    	$table->integer('created_by')->unsigned()->nullable();
	    	$table->multiLineString('description')->nullable();
	    	$table->timestamps();
	    });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
