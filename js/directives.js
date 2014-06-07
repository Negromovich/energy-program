'use strict';

/* Directives */

angular.module('energy.directives', [])
    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    if (changeEvent.target.files[0].size > 1048576) {
                        alert('Слишком большой файл (превышает 1 мБ)');
                    } else {
                        var reader = new FileReader();
                        reader.onload = function (loadEvent) {
                            scope.$apply(function () {
                                scope.fileread = loadEvent.target.result;
                            });
                        };
                        reader.readAsText(changeEvent.target.files[0]);
                    }
                });
            }
        }
    }]);
