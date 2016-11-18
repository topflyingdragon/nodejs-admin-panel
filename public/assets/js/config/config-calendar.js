'use strict';
angular.module('myModule', ['mwl.calendar'])
  .config(function(calendarConfigProvider) {

    calendarConfigProvider.setDateFormatter('moment'); // use moment to format dates

  });