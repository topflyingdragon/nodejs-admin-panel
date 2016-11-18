'use strict';
/**
 * Controller of the angularBootstrapCalendarApp
*/
app.controller('CalendarCtrl', ["$scope", "$aside", "moment", "SweetAlert", function ($scope, $aside, moment, SweetAlert) {


var vm = this;
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [
	  {
	      title: 'Birthday Party',
	      type: 'home',
	      startsAt: new Date(y, m, 5, 19, 0),
	      endsAt: new Date(y, m, 5, 22, 30)
	  },
	  {
	      title: 'AngularJS Seminar',
	      type: 'off-site-work',
	      startsAt: new Date(y, m, 8, 10, 30),
	      endsAt: new Date(y, m, 9, 18, 30)
	  },
      {
          title: 'Event 1',
          type: 'job',
          startsAt: new Date(y, m, d - 5),
          endsAt: new Date(y, m, d - 2)
      },
      {
          title: 'Event 2',
          type: 'cancelled',
          startsAt: new Date(y, m, d - 3, 16, 0),
          endsAt: new Date(y, m, d - 3, 18, 0)
      },
      {
          title: 'This is a really long event title',
          type: 'to-do',
          startsAt: new Date(y, m, d + 1, 19, 0),
          endsAt: new Date(y, m, d + 1, 22, 30)
      },
    ];

    $scope.calendarView = 'month';
    $scope.calendarDay = new Date();

    function showModal(action, event) {
        var modalInstance = $aside.open({
            templateUrl: 'calendarEvent.html',
            placement: 'right',
            size: 'sm',
            backdrop: true,
            controller: function ($scope, $uibModalInstance) {
                $scope.$modalInstance = $uibModalInstance;
                $scope.action = action;
                $scope.event = event;
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.deleteEvent = function () {
                    $uibModalInstance.close($scope.event, $scope.event);
                };

            }
        });
        modalInstance.result.then(function (selectedEvent, action) {

            $scope.eventDeleted(selectedEvent);

        });
    }


    $scope.eventClicked = function (event) {
        showModal('Clicked', event);
    };
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'New Event',
            startsAt: new Date(y, m, d, 10, 0),
            endsAt: new Date(y, m, d, 11, 0),
            type: 'job'
        });
        $scope.eventEdited($scope.events[$scope.events.length - 1]);
    };

    $scope.eventEdited = function (event) {
        showModal('Edited', event);
    };

    $scope.eventDeleted = function (event) {

        SweetAlert.swal({
            title: "Are you sure?",
            text: "Your will not be able to recover this event!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel plx!",
            closeOnConfirm: false,
            closeOnCancel: false
        }, function (isConfirm) {
            if (isConfirm) {
                $scope.events.splice(event.$id, 1);
                SweetAlert.swal("Deleted!", "Event has been deleted.", "success");
            } else {
                SweetAlert.swal("Cancelled", "Event is safe :)", "error");
            }
        });
    };


    $scope.toggle = function ($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();

        event[field] = !event[field];
    };



}]);
