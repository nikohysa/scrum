
let Backlog = function(widget) {
	let self = this;
	self.widget = $(widget);
	self.widget.find('[data-element=story]').each(function () {
		new Story(this);
	});
}

let Story = function (story) {
	let self = this;

	self.widget = $(story);
	self.id = self.widget.attr('data-element-id');

	self.assigned = self.widget.find('[data-control=assignedTo]');
	self.status = self.widget.find('[data-control=status]');
	self.sprint = self.widget.find('[data-control=sprint]');
	self.project = self.widget.find('[data-control=project]');
	self.addEvents();
};
Story.prototype.addEvents = function () {
	let self = this;
	self.assigned.on('change', function () {
		self.updateAssignedTo();
	})
	self.status.on('change', function () {
		self.updateStatus();
	})
	self.sprint.on('change', function () {
		self.updateSprint();
	});
	self.widget.find('td:nth-child(-n+4)').on('click', function () {
		window.location = "/story/"+self.id;
	})
	self.project.on('change', function () {
		self.updateProject();
	})
};
Story.prototype.updateAssignedTo = function () {
	let self = this;
	jQuery.ajax({
		url: '/stories/update/'+self.id,
		data: {
			user_id: self.assigned.val()
		},
		method: "POST",
	}).done(function (response) {
		new Notifications().addNotification(new Notification("Story updated","success","#"))
	});
};
Story.prototype.updateStatus = function () {
	let self = this;
	jQuery.ajax({
		url: '/stories/update/'+self.id,
		data: {
			status_id: self.status.val()
		},
		method:"POST",
	}).done(function (response) {
		new Notifications().addNotification(new Notification("Story updated","success","#"))
	})
}
Story.prototype.updateSprint = function () {
	let self = this;
	jQuery.ajax({
		url: '/stories/update/' + self.id,
		data: {
			sprint_id: self.sprint.val()
		},
		method:"POST"
	}).done(function (response) {
		new Notifications().addNotification(new Notification("Story updated","success","#"))
	})
}
Story.prototype.updateProject = function () {
	let self = this;
	jQuery.ajax({
		url: '/stories/update/' + self.id,
		data: {
			project_id: self.project.val()
		},
		method:"POST"
	}).done(function (response) {
		new Notifications().addNotification(new Notification("Story updated","success","#"))
	})
}

/*INIT*/
new Backlog("[data-element=backlog]");
