'use strict';
/**
 * controller for User Profile Example
 */
app.controller('usersCtrl', ["$scope", "$filter", "ngTableParams", '$http', function ($scope, $filter, ngTableParams, $http) {
    $http({
        url: "/admin/userList",
        method: "GET",
        data: {}
    }).success(function(response, status, headers, config) {
        if(response.code==200){
            $scope.data = response.data;
        }
        refreshTable();
    }).error(function(response, status, headers, config) {
        $scope.status = status;
    });

    var refreshTable = function(){
        var data = $scope.data;
        $scope.tableParams = new ngTableParams({
            page: 1, // show first page
            count: 5, // count per page
            filter: {
                name: '' // initial filter
            }
        }, {
            total: data.length, // length of data
            getData: function ($defer, params) {
                // use build-in angular filter
                var orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;
                $scope.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                params.total(orderedData.length);
                // set total for recalc pagination
                $defer.resolve($scope.users);
            }
        });
    }

    $scope.onClearName = function(user){
        var r = confirm("Do you really want to remove name?");
        if (r != true) {
            return;
        }

        $http({
            url: "/admin/clearUserName",
            method: "POST",
            data: {userId: user._id}
        }).success(function(response, status, headers, config) {
            if(response.code==200){
                $scope.data.forEach(function(item){
                    if(item._id == user._id){
                        item.firstName = "";
                        item.lastName = "";
                        item.name = "";
                    }
                });
            }

        }).error(function(response, status, headers, config) {
            $scope.status = status;
        });
    }

}]);