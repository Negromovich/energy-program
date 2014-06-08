function getEnergy() {
    var self = {};

    var nodes = [],
        edges = [],
        errors = [];

    self.SQRT3 = math.sqrt(3);

    self.results = {};
    self.params = {
        Unom: 10,
        UnomDown: 0.38,
        SHN: {a0: 1, a1: 0, a2: 0, a3: 0, b0: 1, b1: 0, b2: 0, b3: 0},
        transformerInsensetive: 1.157,
        transformerRegimes: [{max:+5,min:0},{max:+10,min:+5},{max:+10,min:0},{max:0,min:-5},{max:0,min:0},{max:+5,min:+5}],
        transformerAdditions: {"-5%": 10.8, "-2.5%": 7.9, "0%": 5.26, "+2.5%": 2.63, "+5%": 0.26},
        voltageDown: {dUmax: 0, dUmin: 0}
    };

    self.getErrors = function () { return errors; };
    self.addError = function (text) {
        if (errors.indexOf(text) == -1) {
            errors.push(text);
        }
    };
    self.resetErrors = function () { errors = []; };

    self.transformers = [];
    self.transformerEmpty = {type:'',Uvn:0,Unn:0,Snom:0,Pxx:0,Pkz:0,Ukz:0,Ixx:0,Z:0,R:0,X:0,Sxx:0,Qxx:0,G:0,B:0};
    self.loadTransformers = function() {
        var file = 'data/transformers.csv';

        jQuery.get(file, function(data) {
            var rows, values, i, ii, item;

            rows = data.split("\n");
            for (i = 1, ii = rows.length; i < ii; ++i) {
                values = rows[i].replace(/,/g,'.').split(';');

                if (values.length > 7) {
                    item = {
                        type: values[0],
                        Uvn: parseFloat(values[1]),
                        Unn: parseFloat(values[2]),
                        Snom: parseFloat(values[3]),
                        Pxx: parseFloat(values[4]),
                        Pkz: parseFloat(values[5]),
                        Ukz: parseFloat(values[6]),
                        Ixx: parseFloat(values[7])
                    };

                    item.Z = (item.Ukz * Math.pow(item.Uvn, 2) * 1000) / (item.Snom * 100);
                    item.R = (item.Pkz * Math.pow(item.Uvn, 2) * 1000) / Math.pow(item.Snom, 2);
                    item.X = Math.sqrt(Math.pow(item.Z, 2) - Math.pow(item.R, 2));
                    item.Sxx = (item.Ixx * item.Snom) / 100;
                    item.Qxx = Math.sqrt(Math.pow(item.Sxx, 2) - Math.pow(item.Pxx, 2));
                    item.G = item.Pxx / Math.pow(item.Uvn, 2);
                    item.B = item.Qxx / Math.pow(item.Uvn, 2);

                    self.transformers.push(item);
                }
            }
        });
    };
    self.findTransformer = function(type) {
        for (var i = 0, ii = self.transformers.length; i < ii; ++i) {
            if (self.transformers[i].type == type) {
                return self.transformers[i];
            }
        }
        return self.transformerEmpty;
    };
    self.updateTransformer = function(node) {
        if (node) {
            var transformer = self.findTransformer(node.transformer);
            for (var key in transformer) {
                node[key] = transformer[key];
            }
            if (!node.transformer) {
                self.resetNodePowers(node);
            }
        } else {
            var nodes = self.getNodes();
            for (var i in nodes) {
                self.updateTransformer(nodes[i]);
            }
        }
    };


    self.cables = [];
    self.cableEmpty = {mark:'',R0:0,X0:0};
    self.loadCables = function() {
        var file = 'data/cables.csv';

        jQuery.get(file, function(data) {
            var rows, values, i, ii, item;

            rows = data.split("\n");
            for (i = 1, ii = rows.length; i < ii; ++i) {
                values = rows[i].replace(/,/g,'.').split(';');

                if (values.length > 2) {
                    item = {
                        mark: values[0],
                        R0: parseFloat(values[1]),
                        X0: parseFloat(values[2])
                    };

                    self.cables.push(item);
                }
            }
        });
    };
    self.findCable = function(mark) {
        for (var i = 0, ii = self.cables.length; i < ii; ++i) {
            if (self.cables[i].mark == mark) {
                return self.cables[i];
            }
        }
        return self.cableEmpty;
    };
    self.updateCable = function(edge) {
        if (edge) {
            var cable = self.findCable(edge.cable);
            if (cable.R0 > 0) edge.R = math.round(cable.R0 * parseFloat(edge.length), 6);
            if (cable.X0 > 0) edge.X = math.round(cable.X0 * parseFloat(edge.length), 6);
        } else {
            var edges = self.getEdges();
            for (var i in edges) {
                self.updateCable(edges[i]);
            }
        }
    };


    self.getNodes = function (withMain) {
        withMain = withMain === undefined ? true : withMain;
        if (withMain) {
            return nodes;
        } else {
            var result = [];
            for (var i = 0, ii = nodes.length; i < ii; ++i) {
                if (nodes[i].main === undefined || !nodes[i].main) {
                    result.push(nodes[i]);
                }
            }
            return result;
        }
    };
    self.addNode = function (node) {
        var nodeDefault = {node: '', transformer: '', Pmax: 0, Qmax: 0, Pmin: 0, Qmin: 0, dUmax: 5, dUmin: 1.25, main: 0};
        nodes.push(node || nodeDefault);
    };
    self.removeNode = function (node) {
        for (var i in nodes) {
            if (nodes[i].node == node.node) {
                nodes.splice(i, 1);
            }
        }
    };
    self.validateNodes = function () {
        var node, valid = true, i, ii, j;

        if (nodes.length < 2) {
            self.addError('Слишком мало узлов в схеме сети.');
            valid = false;
        }
        for (i = 0, ii = nodes.length; i < ii; ++i) {
            for (j = i + 1; j < ii; ++j) {
                if (nodes[i].node == nodes[j].node) {
                    nodes.splice(j, 1);
                }
            }

            node = nodes[i];

            if (!node.node) {
                self.addError('Не задано название у ' + (i+1) + '-го узла');
                valid = false;
            }

            if (node.main) {
                node.transformer = '';
                self.resetNodePowers(node);
            }

            var keys = ['Pmax', 'Qmax', 'Pmin', 'Qmin', 'dUmax', 'dUmin', 'Snom', 'Uvn', 'R', 'X'];
            for (j in keys) {
                if (node[keys[j]] !== undefined) {
                    node[keys[j]] = parseFloat(node[keys[j]]);
                }
            }
        }
        return valid;
    };
    self.findNode = function (name) {
        for (var i in nodes) {
            if (nodes[i].node == name) {
                return nodes[i];
            }
        }
        return undefined;
    };
    self.resetNodePowers = function (node) {
        node.Pmax = 0; node.Qmax = 0;
        node.Pmin = 0; node.Qmin = 0;
    };
    self.getMainNode = function () {
        for (var i in nodes) {
            if (nodes[i].main) {
                return nodes[i];
            }
        }
        return undefined;
    };


    self.getEdges = function () {
        return edges;
    };
    self.addEdge = function (edge) {
        var edgeDefault = {start: '', finish: '', cable: '', length: 0, R: 0, X: 0};
        edges.push(edge || edgeDefault);
    };
    self.removeEdge = function (edge) {
        for (var i in edges) {
            if (edges[i] == edge) {
                edges.splice(i, 1);
            }
        }
    };
    self.validateEdges = function () {
        var edge, valid = true, i, ii, j;

        if (edges.length < 1) {
            self.addError('Слишком мало ветвей в схеме сети.');
            valid = false;
        }
        for (i = 0, ii = edges.length; i < ii; ++i) {
            edge = edges[i];

            if (!edge.start || !self.findNode(edge.start)) {
                valid = false;
                self.addError('Неверно задан начальный узел у ' + (i+1) + '-й ветви');
            }
            if (!edge.finish || !self.findNode(edge.finish)) {
                valid = false;
                self.addError('Неверно задан конечный узел у ' + (i+1) + '-й ветви');
            }

            var keys = ['R', 'X'];
            for (j in keys) {
                if (edge[keys[j]] !== undefined) {
                    edge[keys[j]] = parseFloat(edge[keys[j]]);
                }
            }
        }
        return valid;
    };


    self.getResults = function () {
        self.resetErrors();
        self.results = {min: {}, max: {}};

        self.validateNodes();
        self.validateEdges();

        if (self.getErrors().length) { return NaN; }

        self.calc();

        if (self.getErrors().length) { return NaN; }

        return self.results;
    };


    /**
     * @param [resultModification]  0 || false - all matrix,
     *                              1 || true - matrix without main node
     *                              -1 - matrix with only main node
     * @param [edges]
     * @returns {Array}
     */
    self.createMatricM = function (resultModification, edges) {
        edges = edges || self.getEdges();
        resultModification = resultModification === undefined ? true : resultModification;

        var matrix = [],
            nodes = self.getNodes(!(resultModification === true || resultModification > 0)),
            i, ii, j, jj;

        for (i = 0, ii = nodes.length; i < ii; ++i) {
            matrix[i] = [];
            for (j = 0, jj = edges.length; j < jj; ++j) {
                if (edges[j].start == nodes[i].node) {
                    matrix[i][j] = +1;
                } else if (edges[j].finish == nodes[i].node) {
                    matrix[i][j] = -1;
                } else {
                    matrix[i][j] = 0;
                }
            }
            if (resultModification < 0 && nodes[i].main !== undefined && nodes[i].main) {
                matrix = matrix[i];
                break;
            }
        }

        return matrix;
    };

    self.setPowers = function (Imax, Imin, cosPhi) {
        var nodes = self.getNodes(false),
            Unom = self.params.Unom,
            i, ii;

        cosPhi = cosPhi || 0.9;
        Imax = Imax / 1000;
        Imin = Imin / 1000;

        var sumS = 0, Smult,
            Smax, Smin,
            phi = math.acos(cosPhi);

        for (i = 0, ii = nodes.length; i < ii; ++i) {
            sumS += nodes[i].Snom + math.abs(math.complex(nodes[i].Pxx, nodes[i].Qxx));
        }

        for (i = 0, ii = nodes.length; i < ii; ++i) {
            Smult = math.complex({r: 1000 * self.SQRT3 * Unom * nodes[i].Snom / sumS, phi: phi});
            Smax = math.multiply(Smult, Imax);
            Smax = math.multiply(Smult, Imax);
            Smin = math.multiply(Smult, Imin);
            nodes[i].Pmax = math.round(Smax.re, 3);
            nodes[i].Qmax = math.round(Smax.im, 3);
            nodes[i].Pmin = math.round(Smin.re, 3);
            nodes[i].Qmin = math.round(Smin.im, 3);
        }

        return self.getPowers();
    };

    self.getPowers = function (mode, voltage) {
        var nodes = self.getNodes(false),
            powers = {max: [], min: []};

        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            powers.max.push(math.complex(nodes[i].Pmax / 1000, nodes[i].Qmax / 1000));
            powers.min.push(math.complex(nodes[i].Pmin / 1000, nodes[i].Qmin / 1000));
        }

        if (mode) {
            if (voltage !== undefined) {
                powers[mode] = self.useSHN(powers[mode], voltage);
            }
            return self.getPowersDown2Up(powers[mode]);
        } else {
            return {
                max: self.getPowersDown2Up(powers['max']),
                min: self.getPowersDown2Up(powers['min'])
            };
        }
    };

    self.getVoltageDown = function () {
        if (self.results.voltageDown !== undefined) {
            return self._clone(self.results.voltageDown);
        }

        var voltage = [],
            nodes = self.getNodes(false);

        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            if (nodes[i].Snom > 0) {
                voltage.push({
                    min: {
                        min: -5 + nodes[i].dUmin,
                        max: +5 + self.params.voltageDown.dUmin
                    },
                    max: {
                        min: -5 + nodes[i].dUmax,
                        max: +5 + self.params.voltageDown.dUmax
                    }
                });
            } else {
                voltage.push(NaN);
            }
        }

        self.results.voltageDown = self._clone(voltage);

        return self._clone(voltage);
    };

    self.getDefaultsMatrixU = function () {
        return math.multiply(math.complex(self.params.Unom, 0), math.ones(self.getNodes(false).length));
    };

    self.getTransformersLoss = function (matrixS, matrixU) {
        var loss = {dU: [], dS: []},
            nodes = self.getNodes(false),
            node, S, U;

        matrixS = self._m2a(matrixS);
        matrixU = self._m2a(matrixU || self.getDefaultsMatrixU());

        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            node = nodes[i]; S = matrixS[i]; U = math.abs(matrixU[i]);
            if (math.abs(S) > 0) {
                loss.dU.push((S.re * node.R + S.im * node.X) / U);
                loss.dS.push(math.complex({
                    re: node.Pxx / 1000 + node.R * (math.pow(S.re, 2) + math.pow(S.im, 2)) / math.pow(U, 2),
                    im: node.Qxx / 1000 + node.X * (math.pow(S.re, 2) + math.pow(S.im, 2)) / math.pow(U, 2)
                }));
            } else {
                loss.dU.push(0);
                loss.dS.push(math.complex(0,0));
            }
        }

        return loss;
    };

    self.getPowersDown2Up = function(matrixS, matrixU) {
        return math.add(matrixS, self.getTransformersLoss(matrixS, matrixU).dS);
    };

    self.getPowersUp2Down = function(matrixS, matrixU) {
        var powers = [],
            nodes = self.getNodes(false),
            a, b, c, d, e, f, g, h, x, y,
            i, ii;

        matrixU = matrixU || self.getDefaultsMatrixU();

        for (i = 0, ii = nodes.length; i < ii; ++i) {
            if (nodes[i].Snom > 0) {
                a = nodes[i].Pxx / 1000 - matrixS.get([i]).re;
                b = nodes[i].Qxx / 1000 - matrixS.get([i]).im;
                c = nodes[i].R / math.pow(math.abs(matrixU.get([i])), 2);
                d = nodes[i].X / math.pow(math.abs(matrixU.get([i])), 2);
                e = nodes[i].X / nodes[i].R;
                f = c*(e*e+1);
                g = 1+2*a*c*e*e;
                h = a+a*a*c*e*e;

                x = (math.sqrt(g*g-4*f*h)-g)/(2*f);
                y = e*x+e*a-b;

                powers.push(math.complex(x, y));
            } else {
                powers.push(math.complex(0,0));
            }
        }

        return math.matrix(powers);
    };

    self.getResists = function () {
        var edges = self.getEdges(),
            resists = [],
            i, ii;
        for (i = 0, ii = edges.length; i < ii; ++i) {
            resists.push(math.complex(edges[i].R, edges[i].X));
        }
        return resists;
    };

    self.useSHN = function (matrixS, matrixU, realValuesU) {
        var a0, a1, a2, a3,
            b0, b1, b2, b3,
            Unom = self.params.UnomDown,
            arrS, arrU, result = [];

        a0 = self.params.SHN.a0; a1 = self.params.SHN.a1; a2 = self.params.SHN.a2; a3 = self.params.SHN.a3;
        b0 = self.params.SHN.b0; b1 = self.params.SHN.b1; b2 = self.params.SHN.b2; b3 = self.params.SHN.b3;

        arrS = self._m2a(matrixS);
        arrU = self._m2a(matrixU.map(self._v));
        arrU = realValuesU ? math.divide(math.subtract(arrU, Unom), Unom) : math.divide(arrU, 100);

        for (var i = 0, ii = arrS.length; i < ii; ++i) {
            result[i] = math.complex({
                re: arrS[i].re * (a0 + a1 * arrU[i] + a2 * math.pow(arrU[i], 2) + a3 * math.pow(arrU[i], 3)),
                im: arrS[i].im * (b0 + b1 * arrU[i] + b2 * math.pow(arrU[i], 2) + b3 * math.pow(arrU[i], 3))
            });
        }

        return math.matrix(result);
    };

    self.calcNetwork = function (mode, coefU, saveResults, branches) {
        if (saveResults === undefined) { saveResults = coefU === undefined; }
        if (self.results[mode].network !== undefined && coefU === undefined && saveResults) {
            return self._clone(self.results[mode].network);
        }

        var funcIteration = function (Y, S, U, Ub, Yb) {
            var result = [], value;
            Y = Y.toArray();
            S = S.toArray();
            U = U.toArray();
            Yb = Yb.toArray();

            for (var i = 0, ii = Y.length; i < ii; ++i) {
                value = 0;
                value = math.subtract(value, math.multiply(Ub, Yb[i]));
                for (var j = 0, jj = Y[i].length; j < jj; ++j) {
                    value = math.add(value, math.multiply(U[j], Y[i][j]));
                }
                value = math.subtract(value, math.divide(S[i], U[i]));
                result.push(value);
            }

            return math.matrix(result);
        };
        var funcDerivative = function (Y, S, U) {
            Y = Y.toArray();
            S = S.toArray();
            U = U.toArray();

            for (var i = 0, ii = Y.length; i < ii; ++i) {
                Y[i][i] = math.add(Y[i][i], math.divide(S[i], math.pow(U[i], 2)));
            }

            return math.matrix(Y);
        };
        var iteration = function(Y, S, U, Ub, Yb) {
            return math.multiply(math.inv(funcDerivative(Y, S, U)), funcIteration(Y, S, U, Ub, Yb));
        };
        var getMatrixYb = function (matrixYy) {
            var result = [];
            matrixYy = matrixYy.toArray();
            for (var i = 0, ii = matrixYy.length; i < ii; ++i) {
                result.push(math.sum(matrixYy[i]));
            }
            return math.matrix(result);
        };

        coefU = coefU || 1;
        var valueUnom = self.params.Unom,
            valueUmain = valueUnom * coefU,
            valueAccuracyMax = 0.000001,
            valueAccuracyI = 1,
            valueAccuracyJ = 1,
            result = {},
            defMatrixM, defMatrixMb, defMatrixS, defMatrixZ,
            matrixM, matrixMb,
            matrixZv, matrixYv, matrixYy, matrixYb,
            matrixUdiff, valueSgen,
            i, j, limitI = 25, limitJ = 25;

        defMatrixM = self.createMatricM();
        defMatrixMb = self.createMatricM(-1);
        defMatrixS = self.getPowers(mode);
        defMatrixZ = self.getResists();

        matrixM = math.matrix(defMatrixM);
        matrixMb = math.matrix(defMatrixMb);

        matrixZv = math.diag(defMatrixZ);
        matrixYv = math.inv(matrixZv);
        matrixYy = math.multiply(math.multiply(matrixM, matrixYv), math.transpose(matrixM));
        matrixYb = getMatrixYb(matrixYy);

        result.matrixS = math.matrix(defMatrixS);
        result.valueUmain = math.complex({r: valueUmain, phi: math.sum(defMatrixS).toPolar().phi});
        result.valueSgen = math.complex(0, 0);

        for (j = 0; j < limitJ && valueAccuracyJ > valueAccuracyMax; ++j) {
            result.matrixUy = math.multiply(math.ones(defMatrixS.length), result.valueUmain);
            result.matrixUyd = math.zeros(defMatrixS.length);
            valueAccuracyI = 1;

            for (i = 0; i < limitI && valueAccuracyI > valueAccuracyMax; ++i) {
                matrixUdiff = iteration(matrixYy, math.unary(result.matrixS), result.matrixUy, result.valueUmain, matrixYb);
                result.matrixUyd = math.add(result.matrixUyd, matrixUdiff);
                result.matrixUy = math.subtract(result.valueUmain, result.matrixUyd);
                result.voltage = self.calcVoltage(result.matrixS, result.matrixUyd, result.matrixUy, result.valueUmain);
                result.matrixS = self.getPowers(mode, self.getVoltageReal(result.voltage.delta, branches));

                valueAccuracyI = math.max(math.abs(matrixUdiff));
            }

            valueSgen = result.valueSgen;

            result.valueSgen = math.multiply(
                math.multiply(
                    math.multiply(
                        math.multiply(
                            result.valueUmain,
                            math.inv(matrixZv)
                        ),
                        math.transpose(matrixM)
                    ),
                    result.matrixUyd
                ).toArray(),
                matrixMb.toArray()
            );

            result.valueUmain = math.complex({r: math.abs(result.valueUmain), phi: math.unary(result.valueSgen).toPolar().phi});
            valueAccuracyJ = math.abs(math.divide(math.subtract(result.valueSgen, valueSgen), result.valueSgen));
        }

        if (i >= limitI || j >= limitJ) {
            self.addError('Итерационный процесс расчета расходится. Расчет невозможен.');
            return NaN;
        }

        result.matrixUvd = math.multiply(math.transpose(matrixM), result.matrixUyd);
        result.matrixIv = math.divide(math.multiply(math.inv(matrixZv), result.matrixUvd), self.SQRT3);
        result.matrixSvd = math.multiply(self.SQRT3, math.multiply(math.diag(result.matrixUvd), result.matrixIv));

        result.matrixUyp = math.multiply(100, math.divide(math.subtract(result.matrixUy.map(self._v), valueUnom), valueUnom));

        if (saveResults) {
            if (coefU == 1 && branches === undefined) {
                self.results[mode].networkBase = self._clone(result);
            }
            self.results[mode].network = self._clone(result);
        }

        return self._clone(result);
    };

    self.calcVoltage = function (matrixS, matrixUyd, matrixUy, valueUmain) {
        var voltage = {}, voltageLoss = [],
            networkUyd, transformersLoss,
            Unom = self.params.Unom;

        networkUyd = self._m2a(matrixUyd.map(self._v));
        transformersLoss = self.getTransformersLoss(matrixS, matrixUy);

        for (var i = 0, ii = networkUyd.length; i < ii; ++i) {
            voltageLoss.push(networkUyd[i] + transformersLoss.dU[i]);
        }

        voltage.delta = math.multiply(math.subtract(math.abs(valueUmain) - Unom, voltageLoss), 100 / Unom);
        voltage.loss = voltageLoss;
        voltage.lossPercent = math.multiply(voltageLoss, 100 / Unom);

        return voltage;
    };

    self.getVoltage = function (mode, coefU, saveResults, branches) {
        if (saveResults === undefined) { saveResults = coefU === undefined; }
        if (self.results[mode].voltage !== undefined && coefU === undefined && saveResults) {
            return self._clone(self.results[mode].voltage);
        }

        var network = self.calcNetwork(mode, coefU, saveResults, branches),
            voltage;

        if (!network) {
            return NaN;
        }

        voltage = self.getVoltageReal(network.voltage.delta, branches);

        if (saveResults) {
            self.results[mode].voltage = self._clone(voltage);
        }

        return voltage;
    };

    self.getVoltageReal = function(voltage, branches) {
        if (branches) {
            var result = [];

            for (var i = 0, ii = voltage.length; i < ii; ++i) {
                if (branches[i]) {
                    result.push(voltage[i] + self.params.transformerAdditions[branches[i]]);
                } else {
                    result.push(voltage[i]);
                }
            }

            return result;
        } else {
            return voltage;
        }
    };

    self.calc = function (saveResults) {
        saveResults = saveResults === undefined ? true : saveResults;
        if (self.results.regimes !== undefined) {
            return self._clone(self.results.regimes);
        }

        var valueInsens = self.params.transformerInsensetive,
            voltageDown, voltageMax, voltageMin,
            regimes = self.params.transformerRegimes,
            additions = self.params.transformerAdditions,
            branches, regime,
            result, i;

        var combineLimits = function (limits1, limits2) {
            return {
                max: limits1.max < limits2.max ? limits1.max : limits2.max,
                min: limits1.min > limits2.min ? limits1.min : limits2.min
            };
        };

        var getLimits = function (voltageDown, valueU) {
            return {
                max: voltageDown.max - valueInsens - valueU,
                min: voltageDown.min + valueInsens - valueU
            };
        };

        var getBranches = function (addUmax, addUmin, voltageMax, voltageMin, usedBranches) {
            var dUmax, dUmin,
                limitsMax, limitsMin,
                branches = [],
                allSet = true,
                i, ii, j;

            for (i = 0, ii = voltageDown.length; i < ii; ++i) {
                if (voltageDown[i]) {
                    limitsMax = getLimits(voltageDown[i].max, addUmax);
                    limitsMin = getLimits(voltageDown[i].min, addUmin);

                    if (usedBranches) {
                        voltageMax[i] -= additions[usedBranches[i]];
                        voltageMin[i] -= additions[usedBranches[i]];
                    }

                    for (j in additions) {
                        dUmax = voltageMax[i] + additions[j];
                        dUmin = voltageMin[i] + additions[j];
                        if (dUmax > limitsMax.min && dUmax < limitsMax.max && dUmin > limitsMin.min && dUmin < limitsMin.max) {
                            branches[i] = j;
                            break;
                        }
                    }

                    if (branches[i] === undefined) {
                        allSet = false;
                    }
                }
            }

            return allSet && branches.length ? branches : NaN;
        };

        var checkRegime = function(regime, branches) {
            var regimeVoltageMax = self.getVoltage('max', 1 + regime.max / 100, true, branches);
            var regimeVoltageMin = self.getVoltage('min', 1 + regime.min / 100, true, branches);

            if (regimeVoltageMax && regimeVoltageMin) {
                branches = getBranches(0, 0, regimeVoltageMax, regimeVoltageMin, branches);
                if (branches) {
                    return branches;
                }
            }

            return NaN;
        };

        voltageDown = self.getVoltageDown();
        voltageMax = self.getVoltage('max');
        voltageMin = self.getVoltage('min');

        if (!voltageMax || !voltageMin) {
            return NaN;
        }

        var regimeMain = {regime: NaN, branches: NaN},
            regimeMin = {regime: NaN, branches: NaN},
            regimeMax = {regime: NaN, branches: NaN};

        for (i in regimes) {
            regime = regimes[i];
            branches = getBranches(regime.max, regime.min, voltageMax, voltageMin);
            if (branches && (branches = checkRegime(regime, branches))) {
                regimeMain = {regime: regime, branches: branches};
                break;
            }
        }

        regime = {max: -0.1, min: -0.1};
        mainWhile:
        while (regime.min < 2.45) {
            regime = {max: regime.min, min: regime.min + 0.1};
            while (regime.max < 7.45) {
                regime = {max: regime.max + 0.1, min: regime.min};
                branches = getBranches(regime.max, regime.min, voltageMax, voltageMin);
                if (branches) {
                    if (!regimeMin.regime) {
                        regimeMin = {regime: regime, branches: branches};
                    }
                    regimeMax = {regime: regime, branches: branches};
                } else if (regimeMax.regime) {
                    break mainWhile;
                }
            }
        }

        if (!regimeMain.regime && regimeMin.regime && regimeMax.regime) {
            regime = {
                max: (regimeMin.regime.max + regimeMax.regime.max) / 2,
                min: (regimeMin.regime.min + regimeMax.regime.min) / 2
            };
            branches = getBranches(regime.max, regime.min, voltageMax, voltageMin);
            if (branches && (branches = checkRegime(regime, branches))) {
                regimeMain = {regime: regime, branches: branches};
            }
        }

        if (!regimeMain.regime) {
            self.results.max.network = self._clone(self.results.max.networkBase);
            self.results.min.network = self._clone(self.results.min.networkBase);
        }

        result = {main: regimeMain, min: regimeMin, max: regimeMax};

        if (saveResults) {
            self.results.regimes = self._clone(result);
        }

        return self._clone(result);
    };


    self._m2a = function (matrix) {
        if (matrix instanceof math.type.Matrix) {
            return matrix.toArray();
        } else {
            return matrix;
        }
    };

    self._v = function (value) {
        if (value instanceof math.type.Complex) {
            return math.abs(value);
        } else {
            return value;
        }
    };

    self._clone = function (obj) {
        return _.clone(obj); // use underscore.js

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = self._clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = self._clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };


    self.exportData = function () {
        var nodeKeys = ['node', 'main', 'transformer', 'Pmax', 'Qmax', 'Pmin', 'Qmin', 'dUmax', 'dUmin'],
            edgeKeys = ['start', 'finish', 'cable', 'length', 'R', 'X'],
            exportData = {nodes: [], edges: []},
            nodes = self.getNodes(),
            edges = self.getEdges(),
            node, edge,
            string = "\ufeff",
            i, j;

        for (i in nodes) {
            node = [];
            for (j in nodeKeys) {
                node.push(nodes[i][nodeKeys[j]]);
            }
            exportData.nodes.push(node);
        }

        for (i in edges) {
            edge = [];
            for (j in edgeKeys) {
                edge.push(edges[i][edgeKeys[j]]);
            }
            exportData.edges.push(edge);
        }

        string += exportData.nodes
            .map(function(v){return v.map(function(v){return (v+'').replace(/\./, ',');}).join(';');}).join("\n");
        string += "\n\n";
        string += exportData.edges
            .map(function(v){return v.map(function(v){return (v+'').replace(/\./, ',');}).join(';');}).join("\n");

        return string;
    };

    self.importData = function (data) {
        var rows, values,
            i = 0, ii;

        rows = data.replace(/^\s+|\s+$/g,'').split("\n");

        nodes.splice(0, nodes.length);
        edges.splice(0, edges.length);

        for (ii = rows.length; i < ii; ++i) {
            values = rows[i].replace(/,/g,'.').split(';');
            if (values.length > 8) {
                self.addNode({
                    node: values[0],
                    main: parseInt(values[1]),
                    transformer: values[2],
                    Pmax: parseFloat(values[3]),
                    Qmax: parseFloat(values[4]),
                    Pmin: parseFloat(values[5]),
                    Qmin: parseFloat(values[6]),
                    dUmax: parseFloat(values[7]),
                    dUmin: parseFloat(values[8])
                });
            } else {
                ++i;
                break;
            }
        }

        for (ii = rows.length; i < ii; ++i) {
            values = rows[i].replace(/,/g,'.').split(';');
            if (values.length > 5) {
                self.addEdge({
                    start: values[0],
                    finish: values[1],
                    cable: values[2],
                    length: parseFloat(values[3]),
                    R: parseFloat(values[4]),
                    X: parseFloat(values[5])
                });
            } else {
                break;
            }
        }

        self.updateTransformer();
        self.updateCable();
    };

    self.init = function() {
        self.loadTransformers();
        self.loadCables();

        self.updateTransformer();
        self.updateCable();

        setTimeout(function() {
            self.updateTransformer();
            self.updateCable();
        }, 500);
    };

    return self;
}

var energy = getEnergy();
energy.init();