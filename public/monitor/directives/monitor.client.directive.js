angular.module('monitor')
    .directive('barChart', function() {
        function timelineBgndTick(svg, data) {
            console.log(data);
            //sort bars based on value
            data = data.sort(function(a, b) {
                return d3.ascending(a.value, b.value);
            })

            //set up svg using margin conventions - we'll need plenty of room on the left for labels
            var margin = {
                top: 15,
                right: 25,
                bottom: 15,
                left: 60
            };

            var width = 400 - margin.left - margin.right,
                height = 250 - margin.top - margin.bottom;

            svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            
            svg = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x = d3.scale.linear()
                .range([0, width])
                .domain([0, d3.max(data, function(d) {
                    return d.value;
                })]);

            var y = d3.scale.ordinal()
                .rangeRoundBands([height, 0], .1)
                .domain(data.map(function(d) {
                    return d.name;
                }));

            //make y axis to show bar names
            var yAxis = d3.svg.axis()
                .scale(y)
                //no tick marks
                .tickSize(0)
                .orient("left");

            var gy = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)

            var bars = svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("g")

            //append rects
            bars.append("rect")
                .attr("class", "bar")
                .attr("y", function(d) {
                    return y(d.name);
                })
                .attr("height", y.rangeBand())
                .attr("x", 0)
                .attr("width", function(d) {
                    return x(d.value);
                });

            //add a value label to the right of each bar
            bars.append("text")
                .attr("class", "label")
                //y position of the label is halfway down the bar
                .attr("y", function(d) {
                    return y(d.name) + y.rangeBand() / 2 + 4;
                })
                //x position is 3 pixels to the right of the bar
                .attr("x", function(d) {
                    return x(d.value) + 3;
                })
                .text(function(d) {
                    return d.value;
                });
        }
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            compile: function(element, attrs, transclude) {
                console.log('here');
                // Return the link function
                return function(scope, element, attrs) {
                    // Create a SVG root element
                    var svg = d3.select(element[0]).append('svg');

                    // Watch the data attribute of the scope
                    scope.$watch('data', function(newVal, oldVal, scope) {
                        if (scope.data) {
                            console.log(scope.data)
                            timelineBgndTick(svg, scope.data);
                        }
                    });
                };
            }
        };
    });





// var div = d3.select("body").append("div").attr("class", "toolTip");



// svg = d3.select('body')
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);
