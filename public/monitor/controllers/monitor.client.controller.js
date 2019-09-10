// Invoke 'strict' JavaScript mode
'use strict';

angular.module('monitor').controller('MonitorController', ['$scope', '$interval', '$http', '$routeParams', 'd3', 'SimpleHttpLoader',
    function($scope, $interval, $http, $routeParams, d3, SimpleHttpLoader) {
        var self = this,
            j = 0,
            counter = 0;

        self.mode = 'query';
        self.activated = true;
        self.determinateValue = 0;
        self.progressValue = 0;
        self.showList = [];
        self.vidfile = undefined;

        self.timer = undefined;
        self.startTimer = function() {
            SimpleHttpLoader('/record', { duration: self.duration }).then(function(response) {
                var resdata = JSON.parse(response.data);
                var rfpath = resdata.recordfilepath
                self.vidfile = '.'+rfpath.substr(rfpath.indexOf('public')+6, rfpath.length);
                console.log(self.vidfile);
                SimpleHttpLoader('/cpm', resdata).then(function(response) {
                    // SimpleHttpLoader('/classify', { input: self.vidfile }).then(function(response) {

                    //     console.log(self.data);
                    // });
                    // console.log(self.data);
                });
            });

            self.timer = $interval(function() {
                self.determinateValue += 1;
                self.progressValue = self.determinateValue * 100 / self.duration;
                console.log('in timer', self.determinateValue, self.duration);
                if (self.determinateValue == self.duration + 1) {
                    self.determinateValue = 0;
                    // self.progressValue = 0;
                    $interval.cancel(self.timer);
                    // self.vidfile = './data/' + self.sessionid + '/outputfile.mp4';
                }
            }, 1000, 0, true);
        }

        self.duration = 10;
        self.bardata = [{
            "name": "Walking",
            "value": 12,
        }, {
            "name": "Jogging",
            "value": 19,
        }, {
            "name": "Waving",
            "value": 5,
        }, {
            "name": "Clapping",
            "value": 16,
        }, {
            "name": "Boxing",
            "value": 30,
        }];
        self.magic = function() {
            console.log(self.uri);
            self.loading = true;

            SimpleHttpLoader('/magic', { uri: self.uri }).then(function(response) {
                self.data = response.data;

            });
        }

        $scope.dataArray = [{
            src: 'https://www.travelexcellence.com/images/movil/La_Paz_Waterfall.jpg'
        }, {
            src: 'http://www.parasholidays.in/blog/wp-content/uploads/2014/05/holiday-tour-packages-for-usa.jpg'
        }, {
            src: 'http://clickker.in/wp-content/uploads/2016/03/new-zealand-fy-8-1-Copy.jpg'
        }, {
            src: 'http://images.kuoni.co.uk/73/indonesia-34834203-1451484722-ImageGalleryLightbox.jpg'
        }, {
            src: 'http://images.kuoni.co.uk/73/malaysia-21747826-1446726337-ImageGalleryLightbox.jpg'
        }, {
            src: 'http://www.kimcambodiadriver.com/uploads/images/tours/kim-cambodia-driver-angkor-wat.jpg'
        }, {
            src: 'https://www.travcoa.com/sites/default/files/styles/flexslider_full/public/tours/images/imperialvietnam-halong-bay-14214576.jpg?itok=O-q1yr5_'
        }];
    }
]);
