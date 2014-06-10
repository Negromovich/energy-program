'use strict';

/* Controllers */

var AppControllers = {};

AppControllers.inputCtrl = {};

angular.module('energy.controllers', [])

    .controller('Nodes', ['$scope', '$route', function($scope, $route) {
        $scope.$parent.currentTab = 'Nodes';

        $scope.nodes = energy.getNodes();
        $scope.$watch('nodes', watchListenerClearingData, true);

        $scope.params = energy.params.temp;
        $scope.transformers = [{}].concat(energy.transformers);

        $scope.addNodeEmpty = function () {
            energy.addNode();
            energy.clearResults();
        };

        $scope.removeNode = function (node) {
            energy.removeNode(node);
            energy.clearResults();
        };

        $scope.updateTransformer = function (node) {
            energy.updateTransformer(node);
            energy.clearResults();
        };

        $scope.setMainParams = function (params) {
            energy.setPowers(params.Imax, params.Imin, params.cosPhiMax, params.cosPhiMin);
            energy.clearResults();
        };

        $scope.updateMainNode = function (node) {
            for (var i = 0; i < $scope.nodes.length; i++) {
                if (node !== $scope.nodes[i]) {
                    $scope.nodes[i].main = false;
                }
            }
            energy.clearResults();
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
            $scope.SHN.a0 =  1;
            $scope.SHN.a1 = -0.75;
            $scope.SHN.a2 =  4.75;
            $scope.SHN.a3 =  2.51;
            $scope.SHN.b0 =  1;
            $scope.SHN.b1 =  3;
            $scope.SHN.b2 =  2.2;
            $scope.SHN.b3 =  0;
        };

        $scope.setLosses = function(params) {
            for (var i in $scope.nodes) {
                if (params.dUmax) { $scope.nodes[i].dUmax = params.dUmax; }
                if (params.dUmin) { $scope.nodes[i].dUmin = params.dUmin; }
            }
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

        $scope.importDataDiplom = function() {
            var file = 'data/energy_data.csv';
            jQuery.get(file, function(data) {
                energy.importData(data);
                $route.reload();
            });
        };
    }])


    .controller('Edges', ['$scope', function($scope) {
        $scope.$parent.currentTab = 'Edges';

        $scope.nodes = energy.getNodes();
        $scope.edges = energy.getEdges();
        $scope.$watch('nodes', watchListenerClearingData, true);
        $scope.$watch('edges', watchListenerClearingData, true);

        $scope.cables = [{}].concat(energy.cables);

        $scope.addEdgeEmpty = function () {
            energy.addEdge();
            energy.clearResults();
        };

        $scope.removeEdge = function (edge) {
            energy.removeEdge(edge);
            energy.clearResults();
        };

        $scope.updateCable = function (edge) {
            self.updateCable(edge);
            energy.clearResults();
        };
    }])


    .controller('Results', ['$scope', function($scope) {
        $scope.$parent.currentTab = 'Results';

        var results = energy.getResults();

        $scope.errors = energy.getErrors();

        if (!$scope.errors.length) {
            _prepareResults(results, $scope);
        }
    }])


    .controller('Regime', ['$scope', '$route', function($scope, $route) {
        $scope.$parent.currentTab = 'Regime';
        $scope.regime = energy.params.defaultRegime;

        var results = energy.calcRegime($scope.regime);

        _prepareResults(results, $scope);

        $scope.updateRegime = function() {
            $route.reload();
        }
    }])


    .controller('Branches', ['$scope', '$route', function($scope, $route) {
        $scope.$parent.currentTab = 'Branches';

        $scope.defaultBranches = energy.params.defaultBranches;

        $scope.additions = [];
        for (var addition in energy.params.transformerAdditions) {
            $scope.additions.push(addition);
        }

        var nodes = energy.getNodes(false);

        var getBranches = function() {
            var branches = [];

            for (var i = 0, ii = $scope.nodes.length; i < ii; ++i) {
                if (nodes[i].Snom > 0) {
                    if ($scope.nodes[i].branch) {
                        branches[i] = $scope.nodes[i].branch;
                    } else {
                        return [];
                    }
                }
            }

            return branches;
        };

        $scope.nodes = [];
        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            if (nodes[i].Snom > 0) {
                if ($scope.defaultBranches[i]) {
                    nodes[i].branch = $scope.defaultBranches[i];
                }
                $scope.nodes[i] = nodes[i];
            }
        }
        $scope.$watch('nodes', function() {
            $scope.defaultBranches = getBranches();
            energy.defaultBranches = $scope.defaultBranches;
        }, true);

        $scope.globalBranch = '';
        $scope.setGlobal = function (value) {
            for (var i in $scope.nodes) {
                $scope.nodes[i].branch = value;
            }
            $scope.defaultBranches = getBranches();
            energy.defaultBranches = $scope.defaultBranches;
        };
        $scope.clearGlobal = function () {
            $scope.globalBranch = '';
        };

        $scope.calc = function() {
            $route.reload();
        };



        if (($scope.branches = getBranches()).length) {
            var results = energy.calcRegimeBranches($scope.branches);
            console.log('branches results', results);
            _prepareResults(results, $scope);
        }
    }]);

function _prepareResults(results, $scope) {
    var nodes = energy.getNodes(false),
        mainNode = energy.getMainNode(),
        edges = energy.getEdges(),
        i, j, mode;

    $scope.nodesTable = [];
    $scope.edgesTable = [];

    $scope.regimes = results.regimes;
    for (i in $scope.regimes) {
        for (mode in {max:NaN,min:NaN}) {
            if ($scope.regimes[i] && $scope.regimes[i].regime[mode]) {
                $scope.regimes[i].regime[mode] = math.round($scope.regimes[i].regime[mode], 2);
            }
        }
    }

    var nodesName = [];
    for (i in nodes) {
        nodesName.push(nodes[i].node);
        $scope.nodesTable.push({
            node: nodes[i].node,
            Snom: nodes[i].Snom,
            dUmax: results.max.network.voltage.loss[i] * 1000,
            dUmin: results.min.network.voltage.loss[i] * 1000,
            dpUmax: results.max.network.voltage.lossPercent[i],
            dpUmin: results.min.network.voltage.lossPercent[i],
            bpUmax: results.max.network.voltageReal[i],
            bpUmin: results.min.network.voltageReal[i],
            Pmax: results.max.network.matrixSn.toArray()[i].re * 1000,
            Pmin: results.min.network.matrixSn.toArray()[i].re * 1000,
            Qmax: results.max.network.matrixSn.toArray()[i].im * 1000,
            Qmin: results.min.network.matrixSn.toArray()[i].im * 1000,
            branch: results.regimes.main.branches[i]
        });
    }
    $scope.nodesTable = [{
        node: mainNode.node
    }].concat($scope.nodesTable);



    $scope.barChart = {
        data: [
            math.abs(results.max.network.voltage.lossPercent).filter(function(v,k){return nodes[k].Snom > 0;}),
            math.abs(results.min.network.voltage.lossPercent).filter(function(v,k){return nodes[k].Snom > 0;})
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
                math.round(results.max.network.voltageReal[i] - energy.params.transformerInsensetive, 6),
                results.voltageDown[i].max.max,
                results.voltageDown[i].max.min,
                math.round(results.max.network.voltageReal[i] + energy.params.transformerInsensetive, 6)
            ]);
            $scope.deltaChart.data.min.push([
                i,
                math.round(results.min.network.voltageReal[i] - energy.params.transformerInsensetive, 6),
                results.voltageDown[i].min.max,
                results.voltageDown[i].min.min,
                math.round(results.min.network.voltageReal[i] + energy.params.transformerInsensetive, 6)
            ]);
            $scope.deltaChart.ticks.push(nodes[i].node);
        }
    }



    var edgeRow;
    for (i in edges) {
        edgeRow = {
            start: edges[i].start,
            finish: edges[i].finish,
            Imax: math.abs(results.max.network.matrixIv.toArray()[i]) * 1000,
            Imin: math.abs(results.min.network.matrixIv.toArray()[i]) * 1000,
            dSmax: math.abs(results.max.network.matrixSvd.toArray()[i]) * 1000,
            dSmin: math.abs(results.min.network.matrixSvd.toArray()[i]) * 1000,
            dPmax: math.abs(results.max.network.matrixSvd.toArray()[i].re) * 1000,
            dPmin: math.abs(results.min.network.matrixSvd.toArray()[i].re) * 1000,
            dQmax: math.abs(results.max.network.matrixSvd.toArray()[i].im) * 1000,
            dQmin: math.abs(results.min.network.matrixSvd.toArray()[i].im) * 1000,
            dUmax: math.abs(results.max.network.matrixUvd.toArray()[i]) * 1000,
            dUmin: math.abs(results.min.network.matrixUvd.toArray()[i]) * 1000
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


    $scope.values = {max: {}, min: {}};
    for (mode in {max:NaN,min:NaN}) {
        $scope.values[mode].SgenCmpx = math.multiply(results[mode].network.valueSgen, 1000);
        $scope.values[mode].Sgen = math.abs($scope.values[mode].SgenCmpx);
        $scope.values[mode].Pgen = $scope.values[mode].SgenCmpx.re;
        $scope.values[mode].Qgen = $scope.values[mode].SgenCmpx.im;

        $scope.values[mode].SpowCmpx = math.multiply(math.sum(results[mode].network.matrixSn), 1000);
        $scope.values[mode].Spow = math.abs($scope.values[mode].SpowCmpx);
        $scope.values[mode].Ppow = $scope.values[mode].SpowCmpx.re;
        $scope.values[mode].Qpow = $scope.values[mode].SpowCmpx.im;

        $scope.values[mode].dSsumCmpx = math.subtract($scope.values[mode].SgenCmpx, $scope.values[mode].SpowCmpx);
        $scope.values[mode].dSsum = math.subtract($scope.values[mode].Sgen, $scope.values[mode].Spow);
        $scope.values[mode].dPsum = math.subtract($scope.values[mode].Pgen, $scope.values[mode].Ppow);
        $scope.values[mode].dQsum = math.subtract($scope.values[mode].Qgen, $scope.values[mode].Qpow);
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
                    tickOptions: {formatString: '%.3f%'}
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

function watchListenerClearingData (newValue, oldValue) {
    if (!angular.equals(newValue, oldValue)) {
        energy.clearResults();
    }
}