"use strict";

app.controller('templateCtrl', ['$rootScope', '$scope', '$cookieStore', '$state', '$filter', 'toaster', 'SweetAlert', '$translate', '$http',
function ($rootScope, $scope, $cookieStore, $state, $filter, toaster, SweetAlert, $translate, $http) {

    $scope.currentStep = 1;

    // Initial Value
    $scope.global = $rootScope;
    $scope.myModel = {};
    


    $scope.setForm = function (form) {

    }


    $scope.form = {

        next: function (form, elem) {
            

                if (form.$valid) {
                    nextStep();
                    setTimeout(function () { $('#' + elem).focus() }, 100);
                } else {
                    var field = null, firstError = null;
                    for (field in form) {
                        if (field[0] != '$') {
                            if (firstError === null && !form[field].$valid) {
                                firstError = form[field].$name;
                            }

                            if (form[field].$pristine) {
                                form[field].$dirty = true;
                            }
                        }
                    }

                    angular.element('.ng-invalid[name=' + firstError + ']').focus();
                    errorMessage();
                }
            
            
        },
        prev: function (form) {
            $scope.toTheTop();
            prevStep();
        },
        goTo: function (form, i) {
            if (parseInt($scope.currentStep) > parseInt(i)) {
                $scope.toTheTop();
                goToStep(i);

            } else {
                if (form.$valid) {
                    $scope.toTheTop();
                    goToStep(i);

                } else
                    errorMessage();
            }
        },
        submit: function (form) {
            var firstError = null;
            if (form.$invalid) {

                // TODO something

            } else {

               
            }
        },
        reset: function () {

        }
    };

    var nextStep = function () {
        $scope.currentStep++;
    };
    var prevStep = function () {
        $scope.currentStep--;
    };
    var goToStep = function (i) {
        $scope.currentStep = i;
    };
    
    

}]);
