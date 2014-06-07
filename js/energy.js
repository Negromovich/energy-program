function getEnergy() {
    var self = {};

    var nodes = [],
        edges = [],
        errors = [];

    self.SQRT3 = math.sqrt(3);

    self.results = {};
    self.params = {
        Unom: 10,
        SHN: {a0: 0.83, a1: -0.3, a2: 0.47, a3: 0, b0: 4.9, b1: -10.1, b2: 6.2, b3: 0},
        transformerInsensetive: 1.157,
        transformerRegimes: [{max:+5,min:0},{max:+10,min:+5},{max:+10,min:0},{max:0,min:-5},{max:0,min:0},{max:+5,min:+5}],
        transformerAdditions: {"+5%": 0.26, "+2.5%": 2.63, "0%": 5.26, "-2.5%": 7.9, "-5%": 10.8},
        voltageDown: {dUmax: 0, dUmin: 0}
    };

    self.getErrors = function () { return errors; };
    self.addError = function (text) {
        if (errors.indexOf(text) == -1) {
            errors.push(text);
        }
    };
    self.resetErrors = function () { errors = []; };

    edges = [
        {start: 'ПС Лошица', finish: 'РП-196', cable: 'АПвПуг(тр)-300 ЭКРАН-50', length: 3.2, R: 0.41600, X: 0.30688},
        {start: 'РП-196', finish: 'ТП1616', cable: 'АСБл-150', length: 0.235, R: 0.04841, X: 0.01857},
        {start: 'ТП1616', finish: 'ТП1631', cable: '', length: 0.336, R: 0.07421, X: 0.02664},
        {start: 'ТП1631', finish: 'ТП1618', cable: 'АСБл-150', length: 0.096, R: 0.01978, X: 0.00758},
        {start: 'ТП1618', finish: 'ТП1619', cable: 'АСБл-150', length: 0.585, R: 0.12051, X: 0.04621},
        {start: 'ТП1619', finish: 'ТП1623', cable: 'АСБл-150', length: 0.610, R: 0.12566, X: 0.04819},
        {start: 'ТП1623', finish: 'ТП1624', cable: 'АСБл-150', length: 0.240, R: 0.04944, X: 0.01896},
        {start: 'ТП1624', finish: 'ТП1625', cable: 'АСБл-150', length: 0.240, R: 0.04944, X: 0.01896},
        {start: 'ТП1625', finish: 'ТП1626', cable: 'АПвПу2г(тр)-120 ЭКРАН-35', length: 0.910, R: 0.29575, X: 0.09828},
        {start: 'РП-196', finish: 'ТП1617', cable: 'АСБ-120', length: 0.220, R: 0.05676, X: 0.01760},
        {start: 'ТП1617', finish: 'ТП1620', cable: 'АСБл-120', length: 0.600, R: 0.15480, X: 0.04800},
        {start: 'ТП1620', finish: 'ТП1628', cable: '', length: 0.568, R: 0.13639, X: 0.05041},
        {start: 'ТП1628', finish: 'ТП1622', cable: 'АПвПуг(тр)-185 ЭКРАН-70', length: 0.233, R: 0.04916, X: 0.02400},
        {start: 'РП-196', finish: 'ТП1621', cable: 'АСБл-120', length: 0.535, R: 0.13803, X: 0.0428},
        {start: 'РП-196', finish: 'ТП1630', cable: '', length: 0.745, R: 0.10107, X: 0.05955},
    ];

    nodes = [
        {node: 'ПС Лошица', transformer: '', Pmax: 0, Qmax: 0, Pmin: 0, Qmin: 0, dUmax: 5, dUmin: 1.25, main: 1, left: 1, top: -1},
        {node: 'РП-196', transformer: '', Pmax: 0, Qmax: 0, Pmin: 0, Qmin: 0, dUmax: 5, dUmin: 1.25, main: 0, left: 0, top: 0},
        {node: 'ТП1616', transformer: 'ТМГ-630', Pmax: 0.114, Qmax: 0.055, Pmin: 0.076, Qmin: 0.037, dUmax: 5, dUmin: 1.25, main: 0, left: 0, top: -1},
        {node: 'ТП1617', transformer: 'ТМГ-400', Pmax: 0.072, Qmax: 0.035, Pmin: 0.048, Qmin: 0.023, dUmax: 5, dUmin: 1.25, main: 0, left: -1, top: 0},
        {node: 'ТП1618', transformer: 'ТМГ-1000', Pmax: 0.18, Qmax: 0.087, Pmin: 0.12, Qmin: 0.058, dUmax: 5, dUmin: 1.25, main: 0, left: 1, top: -3},
        {node: 'ТП1619', transformer: 'ТМГ-1000', Pmax: 0.18, Qmax: 0.087, Pmin: 0.12, Qmin: 0.058, dUmax: 5, dUmin: 1.25, main: 0, left: 2, top: -3},
        {node: 'ТП1620', transformer: 'ТМГ-630', Pmax: 0.114, Qmax: 0.055, Pmin: 0.076, Qmin: 0.037, dUmax: 5, dUmin: 1.25, main: 0, left: -1, top: -1},
        {node: 'ТП1621', transformer: 'ТМГ-1000', Pmax: 0.18, Qmax: 0.087, Pmin: 0.12, Qmin: 0.058, dUmax: 5, dUmin: 1.25, main: 0, left: 0, top: 1},
        {node: 'ТП1622', transformer: 'ТМГ-160', Pmax: 0.029, Qmax: 0.014, Pmin: 0.019, Qmin: 0.009, dUmax: 5, dUmin: 1.25, main: 0, left: -1, top: -3},
        {node: 'ТП1623', transformer: 'ТМ-1000', Pmax: 0.18, Qmax: 0.087, Pmin: 0.12, Qmin: 0.058, dUmax: 5, dUmin: 1.25, main: 0, left: 3, top: -3},
        {node: 'ТП1624', transformer: 'ТМГ-630', Pmax: 0.114, Qmax: 0.055, Pmin: 0.076, Qmin: 0.037, dUmax: 5, dUmin: 1.25, main: 0, left: 4, top: -3},
        {node: 'ТП1625', transformer: 'ТМГ-630', Pmax: 0.114, Qmax: 0.055, Pmin: 0.076, Qmin: 0.037, dUmax: 5, dUmin: 1.25, main: 0, left: 5, top: -3},
        {node: 'ТП1626', transformer: 'ТМГ-400', Pmax: 0.072, Qmax: 0.035, Pmin: 0.048, Qmin: 0.023, dUmax: 5, dUmin: 1.25, main: 0, left: 6, top: -3},
        {node: 'ТП1628', transformer: 'ТМГ-400', Pmax: 0.072, Qmax: 0.035, Pmin: 0.048, Qmin: 0.023, dUmax: 5, dUmin: 1.25, main: 0, left: -1, top: -2},
        {node: 'ТП1630', transformer: 'ТСЗГЛ-1250', Pmax: 0.225, Qmax: 0.109, Pmin: 0.15, Qmin: 0.073, dUmax: 5, dUmin: 1.25, main: 0, left: 1, top: 0},
        {node: 'ТП1631', transformer: 'ТМГ-1250', Pmax: 0.225, Qmax: 0.109, Pmin: 0.15, Qmin: 0.073, dUmax: 5, dUmin: 1.25, main: 0, left: 0, top: -2},
    ];

    nodes = [{"node":"ПС Лошица","transformer":"","Pmax":0,"Qmax":0,"Pmin":0,"Qmin":0,"dUmax":5,"dUmin":1.25,"main":1,"left":1,"top":-1,"type":"","Uvn":0,"Unn":0,"Snom":0,"Pxx":0,"Pkz":0,"Ukz":0,"Ixx":0,"Z":0,"R":0,"X":0,"Sxx":0,"Qxx":0,"G":0,"B":0},{"node":"РП-196","transformer":"","Pmax":0,"Qmax":0,"Pmin":0,"Qmin":0,"dUmax":5,"dUmin":1.25,"main":0,"left":0,"top":0,"type":"","Uvn":0,"Unn":0,"Snom":0,"Pxx":0,"Pkz":0,"Ukz":0,"Ixx":0,"Z":0,"R":0,"X":0,"Sxx":0,"Qxx":0,"G":0,"B":0},{"node":"ТП1616","transformer":"ТМГ-630","Pmax":111.943,"Qmax":54.216,"Pmin":74.629,"Qmin":36.144,"dUmax":5,"dUmin":1.25,"main":0,"left":0,"top":-1,"type":"ТМГ-630","Uvn":10,"Unn":0.4,"Snom":630,"Pxx":1.24,"Pkz":7.6,"Ukz":5.5,"Ixx":1.6,"Z":8.73015873015873,"R":1.9148400100781053,"X":8.517573550581806,"Sxx":10.08,"Qxx":10.003439408523452,"G":0.0124,"B":0.10003439408523451},{"node":"ТП1617","transformer":"ТМГ-400","Pmax":71.075,"Qmax":34.423,"Pmin":47.383,"Qmin":22.949,"dUmax":5,"dUmin":1.25,"main":0,"left":-1,"top":0,"type":"ТМГ-400","Uvn":10,"Unn":0.4,"Snom":400,"Pxx":0.83,"Pkz":5.6,"Ukz":4.5,"Ixx":1.7,"Z":11.25,"R":3.5,"X":10.691702390171548,"Sxx":6.8,"Qxx":6.74915550272773,"G":0.0083,"B":0.0674915550272773},{"node":"ТП1618","transformer":"ТМГ-1000","Pmax":177.687,"Qmax":86.058,"Pmin":118.458,"Qmin":57.372,"dUmax":5,"dUmin":1.25,"main":0,"left":1,"top":-3,"type":"ТМГ-1000","Uvn":10,"Unn":0.4,"Snom":1000,"Pxx":1.6,"Pkz":10.8,"Ukz":5.5,"Ixx":1.3,"Z":5.5,"R":1.08,"X":5.392921286278894,"Sxx":13,"Qxx":12.90116273829611,"G":0.016,"B":0.1290116273829611},{"node":"ТП1619","transformer":"ТМГ-1000","Pmax":177.687,"Qmax":86.058,"Pmin":118.458,"Qmin":57.372,"dUmax":5,"dUmin":1.25,"main":0,"left":2,"top":-3,"type":"ТМГ-1000","Uvn":10,"Unn":0.4,"Snom":1000,"Pxx":1.6,"Pkz":10.8,"Ukz":5.5,"Ixx":1.3,"Z":5.5,"R":1.08,"X":5.392921286278894,"Sxx":13,"Qxx":12.90116273829611,"G":0.016,"B":0.1290116273829611},{"node":"ТП1620","transformer":"ТМГ-630","Pmax":111.943,"Qmax":54.216,"Pmin":74.629,"Qmin":36.144,"dUmax":5,"dUmin":1.25,"main":0,"left":-1,"top":-1,"type":"ТМГ-630","Uvn":10,"Unn":0.4,"Snom":630,"Pxx":1.24,"Pkz":7.6,"Ukz":5.5,"Ixx":1.6,"Z":8.73015873015873,"R":1.9148400100781053,"X":8.517573550581806,"Sxx":10.08,"Qxx":10.003439408523452,"G":0.0124,"B":0.10003439408523451},{"node":"ТП1621","transformer":"ТМГ-1000","Pmax":177.687,"Qmax":86.058,"Pmin":118.458,"Qmin":57.372,"dUmax":5,"dUmin":1.25,"main":0,"left":0,"top":1,"type":"ТМГ-1000","Uvn":10,"Unn":0.4,"Snom":1000,"Pxx":1.6,"Pkz":10.8,"Ukz":5.5,"Ixx":1.3,"Z":5.5,"R":1.08,"X":5.392921286278894,"Sxx":13,"Qxx":12.90116273829611,"G":0.016,"B":0.1290116273829611},{"node":"ТП1622","transformer":"ТМГ-160","Pmax":28.43,"Qmax":13.769,"Pmin":18.953,"Qmin":9.179,"dUmax":5,"dUmin":1.25,"main":0,"left":-1,"top":-3,"type":"ТМГ-160","Uvn":10,"Unn":0.4,"Snom":160,"Pxx":0.41,"Pkz":2.9,"Ukz":4.7,"Ixx":2.1,"Z":29.375,"R":11.328125,"X":27.102845034873646,"Sxx":3.36,"Qxx":3.334891302576442,"G":0.0040999999999999995,"B":0.03334891302576442},{"node":"ТП1623","transformer":"ТМ-1000","Pmax":177.687,"Qmax":86.058,"Pmin":118.458,"Qmin":57.372,"dUmax":5,"dUmin":1.25,"main":0,"left":3,"top":-3,"type":"ТМ-1000","Uvn":10,"Unn":0.4,"Snom":1000,"Pxx":1.55,"Pkz":10.8,"Ukz":5.5,"Ixx":1.2,"Z":5.5,"R":1.08,"X":5.392921286278894,"Sxx":12,"Qxx":11.899474778325303,"G":0.0155,"B":0.11899474778325303},{"node":"ТП1624","transformer":"ТМГ-630","Pmax":111.943,"Qmax":54.216,"Pmin":74.629,"Qmin":36.144,"dUmax":5,"dUmin":1.25,"main":0,"left":4,"top":-3,"type":"ТМГ-630","Uvn":10,"Unn":0.4,"Snom":630,"Pxx":1.24,"Pkz":7.6,"Ukz":5.5,"Ixx":1.6,"Z":8.73015873015873,"R":1.9148400100781053,"X":8.517573550581806,"Sxx":10.08,"Qxx":10.003439408523452,"G":0.0124,"B":0.10003439408523451},{"node":"ТП1625","transformer":"ТМГ-630","Pmax":111.943,"Qmax":54.216,"Pmin":74.629,"Qmin":36.144,"dUmax":5,"dUmin":1.25,"main":0,"left":5,"top":-3,"type":"ТМГ-630","Uvn":10,"Unn":0.4,"Snom":630,"Pxx":1.24,"Pkz":7.6,"Ukz":5.5,"Ixx":1.6,"Z":8.73015873015873,"R":1.9148400100781053,"X":8.517573550581806,"Sxx":10.08,"Qxx":10.003439408523452,"G":0.0124,"B":0.10003439408523451},{"node":"ТП1626","transformer":"ТМГ-400","Pmax":71.075,"Qmax":34.423,"Pmin":47.383,"Qmin":22.949,"dUmax":5,"dUmin":1.25,"main":0,"left":6,"top":-3,"type":"ТМГ-400","Uvn":10,"Unn":0.4,"Snom":400,"Pxx":0.83,"Pkz":5.6,"Ukz":4.5,"Ixx":1.7,"Z":11.25,"R":3.5,"X":10.691702390171548,"Sxx":6.8,"Qxx":6.74915550272773,"G":0.0083,"B":0.0674915550272773},{"node":"ТП1628","transformer":"ТМГ-400","Pmax":71.075,"Qmax":34.423,"Pmin":47.383,"Qmin":22.949,"dUmax":5,"dUmin":1.25,"main":0,"left":-1,"top":-2,"type":"ТМГ-400","Uvn":10,"Unn":0.4,"Snom":400,"Pxx":0.83,"Pkz":5.6,"Ukz":4.5,"Ixx":1.7,"Z":11.25,"R":3.5,"X":10.691702390171548,"Sxx":6.8,"Qxx":6.74915550272773,"G":0.0083,"B":0.0674915550272773},{"node":"ТП1630","transformer":"ТСЗГЛ-1250","Pmax":222.109,"Qmax":107.572,"Pmin":148.073,"Qmin":71.715,"dUmax":5,"dUmin":1.25,"main":0,"left":1,"top":0,"type":"ТСЗГЛ-1250","Uvn":10,"Unn":0.4,"Snom":1250,"Pxx":2.25,"Pkz":10.8,"Ukz":6,"Ixx":1.4,"Z":4.8,"R":0.6912,"X":4.74997290097533,"Sxx":17.5,"Qxx":17.354754391808605,"G":0.0225,"B":0.17354754391808605},{"node":"ТП1631","transformer":"ТМГ-1250","Pmax":222.109,"Qmax":107.572,"Pmin":148.073,"Qmin":71.715,"dUmax":5,"dUmin":1.25,"main":0,"left":0,"top":-2,"type":"ТМГ-1250","Uvn":10,"Unn":0.4,"Snom":1250,"Pxx":1.8,"Pkz":12.4,"Ukz":6,"Ixx":1.2,"Z":4.8,"R":0.7936,"X":4.733941174116975,"Sxx":15,"Qxx":14.891608375189028,"G":0.018000000000000002,"B":0.14891608375189028}];

//    edges = []; nodes = [];

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

        self.results.max.voltageReal = self.getVoltageReal(self.results.max.voltage, self.results.regimes.main.branches);
        self.results.min.voltageReal = self.getVoltageReal(self.results.min.voltage, self.results.regimes.main.branches);

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

    self.getPowers = function (mode) {
        var nodes = self.getNodes(false),
            powers = {max: [], min: []};

        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            powers.max.push(math.complex(nodes[i].Pmax / 1000, nodes[i].Qmax / 1000));
            powers.min.push(math.complex(nodes[i].Pmin / 1000, nodes[i].Qmin / 1000));
        }

        if (mode) {
            return self.getPowersDown2Up(powers[mode]);
        } else {
            return {
                max: self.getPowersDown2Up(powers['max']),
                min: self.getPowersDown2Up(powers['min'])
            };
        }
    };

    self. getVoltageDown = function () {
        if (self.results.voltageDown !== undefined) {
            return self.results.voltageDown;
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

        self.results.voltageDown = voltage;

        return voltage;
    };

    /** @deprecated */
    self.getVoltageTransformers = function (mode) {
        if (self.results[mode].voltageTransformer !== undefined) {
            return self.results[mode].voltageTransformer;
        }

        var voltage = [],
            nodes = self.getNodes(false),
            powers = self.getPowers(mode),
            node, power,
            Unom = self.params.Unom;

        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            node = nodes[i];
            power = powers[i];
            if (math.abs(power) > 0) {
                voltage.push(100 * (power.re * node.R + power.im * node.X) / (node.Uvn * Unom));
            } else {
                voltage.push(0);
            }
        }

        self.results[mode].voltageTransformer = voltage;

        return voltage;
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

    self.useSHN = function (matrixS, matrixU) {
        var a0, a1, a2, a3,
            b0, b1, b2, b3,
            Unom = self.params.Unom,
            arrS, arrU;

        a0 = self.params.SHN.a0; a1 = self.params.SHN.a1; a2 = self.params.SHN.a2; a3 = self.params.SHN.a3;
        b0 = self.params.SHN.b0; b1 = self.params.SHN.b1; b2 = self.params.SHN.b2; b3 = self.params.SHN.b3;

        arrS = matrixS.toArray();
        arrU = self._m2a(matrixU.map(self._v));

        for (var i = 0, ii = arrS.length; i < ii; ++i) {
            arrS[i] = math.complex({
                re: arrS[i].re * (a0 + a1 * arrU[i] / Unom + a2 * math.pow(arrU[i] / Unom, 2) + a3 * math.pow(arrU[i] / Unom, 3)),
                im: arrS[i].im * (b0 + b1 * arrU[i] / Unom + b2 * math.pow(arrU[i] / Unom, 2) + b3 * math.pow(arrU[i] / Unom, 3))
            });
        }

        return math.matrix(arrS);
    };

    self.calcNetwork = function (mode, coefU, saveResults) {
        if (saveResults === undefined) { saveResults = coefU === undefined; }
        if (self.results[mode].network !== undefined && coefU === undefined && saveResults) {
            return self.results[mode].network;
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
            matrixSnom, matrixM, matrixMb,
            matrixZv, matrixYv, matrixYy, matrixYb,
            matrixUdiff, valueSgen,
            i, j, limitI = 25, limitJ = 25;

        defMatrixM = self.createMatricM();
        defMatrixMb = self.createMatricM(-1);
        defMatrixS = self.getPowers(mode);
        defMatrixZ = self.getResists();

        matrixM = math.matrix(defMatrixM);
        matrixMb = math.matrix(defMatrixMb);
        matrixSnom = math.matrix(math.unary(defMatrixS));
        result.matrixS = matrixSnom.clone();

        matrixZv = math.diag(defMatrixZ);
        matrixYv = math.inv(matrixZv);
        matrixYy = math.multiply(math.multiply(matrixM, matrixYv), math.transpose(matrixM));
        matrixYb = getMatrixYb(matrixYy);

        result.valueUmain = math.complex(valueUmain, 0);
        result.valueSgen = math.complex(0, 0);

        for (j = 0; j < limitJ && valueAccuracyJ > valueAccuracyMax; ++j) {
            result.matrixUy = math.multiply(math.ones(defMatrixS.length), result.valueUmain);
            result.matrixUyd = math.zeros(defMatrixS.length);
            valueAccuracyI = 1;

            for (i = 0; i < limitI && valueAccuracyI > valueAccuracyMax; ++i) {
                matrixUdiff = iteration(matrixYy, result.matrixS, result.matrixUy, result.valueUmain, matrixYb);
                result.matrixUyd = math.add(result.matrixUyd, matrixUdiff);
                result.matrixUy = math.subtract(result.valueUmain, result.matrixUyd);
                result.matrixS = self.useSHN(matrixSnom, result.matrixUy);

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

            result.valueUmain = math.complex({r: math.abs(result.valueUmain), phi: result.valueSgen.toPolar().phi});
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
            self.results[mode].network = result;
        }

        return result;
    };

    self.calcVoltage = function (mode, coefU, saveResults) {
        if (saveResults === undefined) { saveResults = coefU === undefined; }
        if (self.results[mode].voltage !== undefined && coefU === undefined && saveResults) {
            return self.results[mode].voltage;
        }

        coefU = coefU || 1;
        var voltage = [], voltageLoss = [],
            network = self.calcNetwork(mode, coefU, saveResults),
            networkUyd,
            transformersLoss,
//            voltageTransformers = self.getVoltageTransformers(mode),
            Unom = self.params.Unom;

        if (!network) {
            return NaN;
        }

        networkUyd = self._m2a(network.matrixUyd.map(self._v));
        transformersLoss = self.getTransformersLoss(self.getPowers(mode), network.matrixUy);

        for (var i = 0, ii = networkUyd.length; i < ii; ++i) {
            voltageLoss.push(math.abs(networkUyd[i]) + transformersLoss.dU[i]);
        }

        voltage = math.multiply(math.subtract(math.abs(network.valueUmain) - Unom, voltageLoss), 100 / Unom);

        if (saveResults) {
            self.results[mode].voltage = voltage;
            self.results[mode].voltageLoss = voltageLoss;
            self.results[mode].voltageLossPerc = math.multiply(voltageLoss, 100 / Unom);
        }

        return voltage;
    };

    self.getVoltageReal = function(voltage, branches) {
        if (branches) {
            var result = [];

            for (var i = 0, ii = voltage.length; i < ii; ++i) {
                result.push(voltage[i] + self.params.transformerAdditions[branches[i]]);
            }

            return result;
        } else {
            return voltage;
        }
    };

    self.calc = function (saveResults) {
        saveResults = saveResults === undefined ? true : saveResults;
        if (self.results.regimes !== undefined) {
            return self.results.regimes;
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
//            return combineLimits(
//                {
//                    max: valueU + valueInsens - voltageDown.min,
//                    min: valueU + valueInsens - voltageDown.max
//                },
//                {
//                    max: valueU - valueInsens - voltageDown.min,
//                    min: valueU - valueInsens - voltageDown.max
//                }
//            );
        };

        var getBranches = function (addUmax, addUmin, voltageMax, voltageMin, force) {
            var dUmax, dUmin,
                limitsMax, limitsMin,
                branches = [],
                allSet = true,
                i, ii, j;

            for (i = 0, ii = voltageDown.length; i < ii; ++i) {
                if (voltageDown[i]) {
                    limitsMax = getLimits(voltageDown[i].max, addUmax);
                    limitsMin = getLimits(voltageDown[i].min, addUmin);

                    for (j in additions) {
                        dUmax = voltageMax[i] + additions[j];
                        dUmin = voltageMin[i] + additions[j];
//                        dUmax = voltageMax[i] - additions[j];
//                        dUmin = voltageMin[i] - additions[j];
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

            return (force || allSet) && branches.length ? branches : NaN;
        };

        var checkRegime = function(regime, branches) {
            var regimeVoltageMax = voltageMax,
                regimeVoltageMin = voltageMin;

            if (regime.min != 0 || regime.max != 0) {
                if (regime.max != 0) {
                    regimeVoltageMax = self.calcVoltage('max', 1 + regime.max / 100, true);
                }
                if (regime.min != 0) {
                    regimeVoltageMin = self.calcVoltage('min', 1 + regime.min / 100, true);
                }
                if (regimeVoltageMax && regimeVoltageMin) {
                    branches = getBranches(0, 0, regimeVoltageMax, regimeVoltageMin);
                    if (branches) {
                        return branches;
                    }
                }
                return NaN;
            } else {
                return branches;
            }
        };

        voltageDown = self.getVoltageDown();
        voltageMax = self.calcVoltage('max');
        voltageMin = self.calcVoltage('min');

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
        top:
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
                    break top;
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

        result = {main: regimeMain, min: regimeMin, max: regimeMax};

        if (saveResults) {
            self.results.regimes = result;
        }

        return result;
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

    self._clone = function (x) {
        if (typeof x == 'object') {
            var m = {};
            for (var key in x) {
                if (x.hasOwnProperty(key)) {
                    m[key] = self._clone(x[key]);
                }
            }
            return m;
        }
        return x;
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

//        for (i in nodes) {
//            node = [];
//            for (j in nodeKeys) {
//                node.push(nodes[i][nodeKeys[j]]);
//            }
//            exportData.nodes.push(node);
//        }
        node = [];
        for (j in nodes[0]) {
            node.push(j);
        }
        exportData.nodes.push(node);
        for (i in nodes) {
            node = [];
            for (j in nodes[i]) {
                node.push(nodes[i][j]);
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