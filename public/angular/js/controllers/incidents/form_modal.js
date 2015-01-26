angular.module('Aggie')

.controller('IncidentFormModalController', [
  '$rootScope',
  '$scope',
  '$q',
  '$state',
  '$modal',
  '$modalStack',
  'Incident',
  'Report',
  'FlashService',
  function($rootScope, $scope, $q, $state, $modal, $modalStack, Incident, Report, flash) {

    function updateReport (report) {
      var defer = $q.defer();
      Report.update({id: report._id}, report, defer.resolve, defer.reject);
      return defer.promise;
    }

    function onIncidentCreate () {
      flash.setNotice('Incident was successfully created.');
      $scope.incidents[inc._id] = inc;
      $rootScope.$state.go('incidents', {}, { reload: true });
    }

    $scope.create = function (report) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: 'templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          incident: function () {
            return {
              status: 'new'
            };
          },
          report: function () {
            return report;
          }
        }
      });

      modalInstance.result.then(function(incident) {
        Incident.create(incident, function(inc) {
          if (report) {
            report._incident = inc._id;
            updateReport(report).then(onIncidentCreate);
          } else {
            onIncidentCreate();
          }
        }, function(err) {
          flash.setAlertNow('Incident failed to be created. Please contact support.');
        });
      });

    };

    $scope.edit = function(incident) {
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: '/templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incident: function() {
            return incident;
          }
        }
      });

      modalInstance.result.then(function(incident) {
        Incident.update({ id: incident._id }, incident, function(response) {
          flash.setNotice('Incident was successfully updated.');
          if ($state.is('incidents')) {
            $state.go('incidents', { page: 1, title: null }, { reload: true });
          } else {
            $state.go('incident', { id: incident._id }, { reload: true });
          }
        }, function() {
          flash.setAlertNow('Incident failed to be updated.');
        });
      });
    };
  }
])

.controller('IncidentFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'incidentStatusOptions',
  'veracityOptions',
  'users',
  'incident',
  'incidents',
  'report',
  function($scope, $modalInstance, incidentStatusOptions, veracityOptions, users, incident, incidents, report) {
    $scope.incidents = incidents.results;
    $scope.incident = angular.copy(incident);
    $scope.users = users.map(function(u) {
      return u.username;
    });
    $scope.veracity = veracityOptions;
    $scope.status = incidentStatusOptions;
    $scope.showErrors = false;
    $scope.report = report;
    $scope.minimal = !!report;
    $scope.minimalLatLng = $scope.minimal;
    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      $modalInstance.close($scope.incident);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
