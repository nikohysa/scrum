<?php

namespace App\Http\Controllers;

use App\Sprint;
use App\Story;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use function redirect;
use function view;

class StoriesController extends AuthenticatedController {
	//

	public function get($id) {
		$story = Story::find($id);

		$this->data['sprints'] = Sprint::all();
		$this->data['users'] = User::all();
		$this->data['story'] = $story;
		return view('stories.edit')->with('data',$this->data);
	}
	public function getAjax($id) {
		return Story::find($id);
	}

	public function create() {
		$this->data['sprints'] = Sprint::all();
		$this->data['users'] = User::all();
		return view('stories/create')->with('data', $this->data);
	}

	public function store(Request $request) {
		$story = new Story();
		$story->title = $request->title;
		$story->description = $request->description;
		$story->user_id = $request->user;
		$story->created_by = Auth::user()->id;
		$story->save();
		$this->notifications[] = [
			'message' =>sprintf("Story: %s created successfully", $story->title),
			'type' => "success",
			"id" => $story->id,
			"url"=>"#"
		];
		return redirect('/home')->with('notifications',$this->notifications);
	}
	public function update(Request $request, $id) {
		$story = Story::find($id);
		$story->title = ($request->exists('title') ?
			$request->input('title'):
			$story->title);
		$story->description = ($request->exists('description') ?
			$request->input('description'):
			$story->description);
		$story->user_id = ($request->exists('user_id') ?
			$request->input('user_id'):
			$story->user_id);
		$story->status_id = ($request->exists('status_id') ?
			$request->input('status_id'):
			$story->status_id);
		$story->sprint_id = ($request->exists('sprint_id') ?
			$request->input('sprint_id'):
			$story->sprint_id);
		$story->project_id = ($request->exists('project_id') ?
			$request->input('project_id'):
			$story->project_id);
		$story->update();
		return $story;
	}

	public function updateWeb(Request $request, $id) {
		$story = $this->update($request, $id);
		$this->notifications[] = [
			'message' =>sprintf("Story: %s updated successfully", $story->title),
			'type' => "success",
			"id" => $story->id,
			"url"=>"#"
		];
		return redirect('/backglog')->with('notifications', $this->notifications);
	}
	public function delete($id) {
		$story = Story::find($id);
		$story->delete();
		$this->notifications[] = [
			'message' =>sprintf("Story: %s deleted", $story->title),
			'type' => "success",
			"url"=>"#"
		];
		return redirect('/backglog')->with('notifications', $this->notifications);
	}
}
