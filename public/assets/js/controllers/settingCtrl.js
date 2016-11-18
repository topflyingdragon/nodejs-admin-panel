'use strict';
/**
 * controller for User Profile Example
 */
app.controller('settingCtrl', ["$scope", '$http', function ($scope, $http) {

    $scope.changeClicked = function(){
        if($scope.cur_password == "" || $scope.new_password == ""){
            alert("The password is invalid");
            return;
        }
        if($scope.new_password != $scope.re_password){
            alert("The password is invalid");
            $scope.new_password = "";
            $scope.re_password = "";
            return;
        }

        $http({
            url: "/admin/changePassword",
            method: "POST",
            data: {
                cur_password: $scope.cur_password,
                new_password: $scope.new_password
            }
        }).success(function(response, status, headers, config) {
            alert(response.message);
        }).error(function(response, status, headers, config) {
            alert("Fail:" + response);
        });
    }

}]);