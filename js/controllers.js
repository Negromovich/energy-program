'use strict';

/* Controllers */

var AppControllers = {};

AppControllers.inputCtrl = {};

angular.module('energy.controllers', [])

    .controller('Nodes', ['$scope', function($scope) {
        $scope.$parent.currentTab = 'Nodes';

        $scope.nodes = energy.getNodes();
        $scope.params = {
            Imax: '',
            Imin: '',
            cosPhi: ''
        };
        $scope.transformers = [{}].concat(energy.transformers);

        $scope.addNodeEmpty = function () {
            energy.addNode();
        };

        $scope.removeNode = function (node) {
            energy.removeNode(node);
        };

        $scope.updateTransformer = function (node) {
            energy.updateTransformer(node);
        };

        $scope.setMainParams = function (params) {
            energy.setPowers(params.Imax, params.Imin, params.cosPhi);
        };

        $scope.updateMainNode = function (node) {
            for (var i = 0; i < $scope.nodes.length; i++) {
                if (node !== $scope.nodes[i]) {
                    $scope.nodes[i].main = false;
                }
            }
        };

        $scope.SHN = energy.params.SHN;
        $scope.clearSHN = function() {
            $scope.SHN.a0 = 1;
            $scope.SHN.a1 = 0;
            $scope.SHN.a2 = 0;
            $scope.SHN.a3 = 0;
            $scope.SHN.b0 = 1;
            $scope.SHN.b1 = 0;
            $scope.SHN.b2 = 0;
            $scope.SHN.b3 = 0;
        };
        $scope.defaultSHN = function() {
//            $scope.SHN.a0 =   0.83;
//            $scope.SHN.a1 =  -0.3;
//            $scope.SHN.a2 =   0.47;
//            $scope.SHN.a3 =   0;
//            $scope.SHN.b0 =   4.9;
//            $scope.SHN.b1 = -10.1;
//            $scope.SHN.b2 =   6.2;
//            $scope.SHN.b3 =   0;
            $scope.SHN.a0 =  1;
            $scope.SHN.a1 = -0.75;
            $scope.SHN.a2 =  4.75;
            $scope.SHN.a3 =  2.51;
            $scope.SHN.b0 =  1;
            $scope.SHN.b1 =  3;
            $scope.SHN.b2 =  2.2;
            $scope.SHN.b3 =  0;
        };

        $scope.exportData = function() {
            var data = energy.exportData();
            download(data, 'energy_data.csv', 'text/csv');
        };

        $scope.importData = function() {
            if ($scope.file === undefined) {
                alert('Вы не выбрали файл.');
            } else if (!$scope.file.length) {
                alert('Файл пустой или еще не до конца загружен. Попробуйте еще раз.');
            } else {
                energy.importData($scope.file);
            }
        };
    }])


    .controller('Edges', ['$scope', function($scope) {
        $scope.$parent.currentTab = 'Edges';

        $scope.nodes = energy.getNodes();
        $scope.edges = energy.getEdges();

        $scope.cables = [{}].concat(energy.cables);

        $scope.addEdgeEmpty = function () {
            energy.addEdge();
        };

        $scope.removeEdge = function (edge) {
            energy.removeEdge(edge);
        };

        $scope.updateCable = function (edge) {
            self.updateCable(edge);
        };
    }])


    .controller('Results', ['$scope', function($scope) {
        $scope.$parent.currentTab = 'Results';

        var results = energy.getResults(),
            nodes = energy.getNodes(false),
            mainNode = energy.getMainNode(),
            edges = energy.getEdges(),
            i, j;

        $scope.errors = energy.getErrors();

        if (!$scope.errors.length) {
            $scope.nodesTable = [];
            $scope.edgesTable = [];

            $scope.regimes = results.regimes;
            for (i in $scope.regimes) {
                $scope.regimes[i].regime.max = math.round($scope.regimes[i].regime.max, 2);
                $scope.regimes[i].regime.min = math.round($scope.regimes[i].regime.min, 2);
            }

            var nodesName = [];
            for (i in nodes) {
                nodesName.push(nodes[i].node);
                $scope.nodesTable.push({
                    node: nodes[i].node,
                    Snom: nodes[i].Snom,
                    dUmax: math.round(results.max.voltageLoss[i] * 1000, 2),
                    dUmin: math.round(results.min.voltageLoss[i] * 1000, 2),
                    dpUmax: math.round(results.max.voltageLossPerc[i], 3),
                    dpUmin: math.round(results.min.voltageLossPerc[i], 3),
                    bpUmax: math.round(results.max.voltageReal[i], 3),
                    bpUmin: math.round(results.min.voltageReal[i], 3),
                    branch: results.regimes.main.branches[i]
                });
            }
            $scope.nodesTable = [{
                node: mainNode.node
            }].concat($scope.nodesTable);



            $scope.barChart = {
                data: [
                    math.multiply(math.abs(results.max.network.matrixUyd.toArray()), 1000)
                        .filter(function(v,k){return nodes[k].Snom > 0;}),
                    math.multiply(math.abs(results.min.network.matrixUyd.toArray()), 1000)
                        .filter(function(v,k){return nodes[k].Snom > 0;})
                ],
                ticks: nodesName.filter(function(v,k){return nodes[k].Snom > 0;})
            };

            $scope.deltaChart = {
                data: {max: [], min: []},
                ticks: []
            };
            for (i in nodes) {
                if (nodes[i].Snom > 0) {
                    $scope.deltaChart.data.max.push([
                        i,
                        math.round(results.max.voltageReal[i] - energy.params.transformerInsensetive, 6),
                        results.voltageDown[i].max.max,
                        results.voltageDown[i].max.min,
                        math.round(results.max.voltageReal[i] + energy.params.transformerInsensetive, 6)
                    ]);
                    $scope.deltaChart.data.min.push([
                        i,
                        math.round(results.min.voltageReal[i] - energy.params.transformerInsensetive, 6),
                        results.voltageDown[i].min.max,
                        results.voltageDown[i].min.min,
                        math.round(results.min.voltageReal[i] + energy.params.transformerInsensetive, 6)
                    ]);
                    $scope.deltaChart.ticks.push(nodes[i].node);
                }
            }



            var edgeRow;
            for (i in edges) {
                edgeRow = {
                    start: edges[i].start,
                    finish: edges[i].finish,
                    Imax: math.round(math.abs(results.max.network.matrixIv.toArray()[i]) * 1000, 3),
                    Imin: math.round(math.abs(results.min.network.matrixIv.toArray()[i]) * 1000, 3),
                    dSmax: math.round(math.abs(results.max.network.matrixSvd.toArray()[i]) * 1000, 3),
                    dSmin: math.round(math.abs(results.min.network.matrixSvd.toArray()[i]) * 1000, 3),
                    dUmax: math.round(math.abs(results.max.network.matrixUvd.toArray()[i]) * 1000, 1),
                    dUmin: math.round(math.abs(results.min.network.matrixUvd.toArray()[i]) * 1000, 1)
                };
                for (j in $scope.nodesTable) {
                    if ($scope.nodesTable[j].node == edges[i].start) {
                        edgeRow.graphS = j;
                    }
                    if ($scope.nodesTable[j].node == edges[i].finish) {
                        edgeRow.graphD = j;
                    }
                }
                $scope.edgesTable.push(edgeRow);
            }

            $scope.barChartInit = function(){
                if (!$scope.barChart.data || !$scope.barChart.data[0].length) { return; }
                var bar_chart = $.jqplot('bar_chart', math.abs($scope.barChart.data), {
                    seriesDefaults:{
                        renderer:$.jqplot.BarRenderer,
                        rendererOptions: {fillToZero: true}
                    },
                    series:[{label:'max'}, {label:'min'}],
                    legend: {show: true},
                    axes: {
                        xaxis: {
                            renderer: $.jqplot.CategoryAxisRenderer,
                            ticks: $scope.barChart.ticks
                        },
                        yaxis: {
                            tickOptions: {formatString: '%.2f В'},
                            tickInterval: 0.5
                        }
                    },
                    highlighter: {
                        show: true,
                        showMarker: false,
                        tooltipAxes: 'y'
                    }
                });
            };

            var deltaChartOptions = {
                axes: {
                    xaxis: {
                        renderer: $.jqplot.CategoryAxisRenderer,
                        ticks: $scope.deltaChart.ticks
                    },
                    yaxis: {
                        tickOptions:{formatString: '%.3f%'}
                    }
                },
                series: [
                    {
                        renderer:$.jqplot.OHLCRenderer, rendererOptions:{
                            candleStick: true,
                            lineWidth: 3
                        }
                    }
                ],
                highlighter: {
                    show: true,
                    showMarker:false,
                    tooltipAxes: 'y',
                    yvalues: 4,
                    formatString:'<table class="jqplot-highlighter"> \
                      <tr><td>δU<sub>н.нб</sub>:</td><td>%s</td></tr> \
                      <tr><td>δU<sub>ТП.нб</sub>:</td><td>%s</td></tr> \
                      <tr><td>δU<sub>ТП.нм</sub>:</td><td>%s</td></tr> \
                      <tr><td>δU<sub>н.нм</sub>:</td><td>%s</td></tr></table>'
                }
            };
            $scope.deltaChartMaxInit = function(){
                if (!$scope.deltaChart.data.max.length) { return; }
                var deltaChartMax = $.jqplot('delta_chart_max',[$scope.deltaChart.data.max], deltaChartOptions);
            };
            $scope.deltaChartMinInit = function(){
                if (!$scope.deltaChart.data.max.length) { return; }
                var deltaChartMin = $.jqplot('delta_chart_min',[$scope.deltaChart.data.min], deltaChartOptions);
            };
        }
    }]);
