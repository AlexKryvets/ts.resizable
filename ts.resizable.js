(function (window, angular, undefined) {

    'use strict';

    angular.module("ts.resizable", []).directive("tsResizable", Resizable);

    function abstractMethod() {}

    function ResizableDelegate() {
        this.onResize = abstractMethod;
    }

    function getStyle(element, property){
        var value = undefined;
        if (window.getComputedStyle) {
            if (window.getComputedStyle.getPropertyValue){
                value = window.getComputedStyle(element, null).getPropertyValue(property)
            } else {
                value = window.getComputedStyle(element)[property];
            }
        } else if (element.currentStyle) {
            value = element.currentStyle[property];
        }

        return value;
    }

    function Resizable () {
        return {
            restrict: "A",
            scope: {
                "delegate": "=?"
            },
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function (scope, element, attrs) {
                        scope.delegate = angular.extend(new ResizableDelegate, scope.delegate);

                        var all = element.children('div');
                        var calculated = null;
                        var horizontal = attrs.direction === "horizontal";

                        angular.forEach(all, function (elem, index) {
                            if (elem.getAttribute("calculated") !== null) {
                                calculated = elem;
                            }
                            if (elem.getAttribute("resizer") !== null) {
                                Resizer(elem, all[index - 1], all[index + 1], horizontal, scope)
                            }
                        });

                        window.addEventListener('resize', calculateDimension, false);
                        scope.$on("ts:resize", calculateDimension);

                        function calculateDimension () {
                            var dimension = 0;
                            angular.forEach(all, function (elem) {
                                if (elem.getAttribute("calculated") === null) {
                                    dimension += horizontal ? elem.offsetWidth : elem.offsetHeight;
                                }
                            });
                            if (horizontal) {
                                calculated.style.width = (element[0].offsetWidth - dimension)  + "px";
                            } else {
                                calculated.style.height = (element[0].offsetHeight - dimension)  + "px";
                            }
                        }
                        calculateDimension();
                    }
                }
            }
        }
    }
    Resizable.$inject = [];

    function Resizer (resizerElement, prevElement, nextElement, horizontal, scope) {
        var startPosition, startDimension1, startDimension2;
        resizerElement.style.cursor = horizontal ? "col-resize" : "row-resize";
        resizerElement.addEventListener("mousedown",onMouseDown);

        function onMouseDown (event) {
            startPosition = horizontal ? event.clientX : event.clientY;
            startDimension1 = parseInt(horizontal ? prevElement.offsetWidth : prevElement.offsetHeight, 10);
            startDimension2 = parseInt(horizontal ? nextElement.offsetWidth : nextElement.offsetHeight, 10);
            document.documentElement.addEventListener('mousemove', onMouseMove, false);
            document.documentElement.addEventListener('mouseup', onMouseUp, false);
        }

        function onMouseMove (event) {
            if (horizontal) {
                var dimension1 = startDimension1 + event.clientX - startPosition;
                var dimension2 = startDimension2 - event.clientX + startPosition;
                if (checkDimensions(dimension1, dimension2)) {
                    prevElement.style.width = dimension1 + 'px';
                    nextElement.style.width = dimension2 + 'px';
                    scope.delegate.onResize(dimension1, dimension2);
                }
            } else {
                var dimension1 = startDimension1 + event.clientY - startPosition;
                var dimension2 = startDimension2 - event.clientY + startPosition;
                if (checkDimensions(dimension1, dimension2)) {
                    prevElement.style.height = dimension1 + 'px';
                    nextElement.style.height = dimension2 + 'px';
                    scope.delegate.onResize(dimension1, dimension2);
                }
            }
        }

        function onMouseUp (event) {
            document.documentElement.removeEventListener('mousemove', onMouseMove, false);
            document.documentElement.removeEventListener('mouseup', onMouseUp, false);
        }

        function checkDimensions (dimension1, dimension2) {
            if (horizontal) {
                var prevMax = parseInt(getStyle(prevElement, "max-width"), 10);
                var prevMin = parseInt(getStyle(prevElement, "min-width"), 10);
                var nextMax = parseInt(getStyle(nextElement, "max-width"), 10);
                var nextMin = parseInt(getStyle(nextElement, "min-width"), 10);
            } else {
                var prevMax = parseInt(getStyle(prevElement, "max-height"), 10);
                var prevMin = parseInt(getStyle(prevElement, "min-height"), 10);
                var nextMax = parseInt(getStyle(nextElement, "max-height"), 10);
                var nextMin = parseInt(getStyle(nextElement, "min-height"), 10);
            }
            var isPositive = dimension1 > 0 && dimension2 > 0;
            var isMinCorrect = (!prevMin ||prevMin < dimension1) && (!nextMin || nextMin < dimension2);
            var isMaxCorrect = (!prevMax || prevMax < dimension1) && (!nextMax || nextMax > dimension2);
            return isPositive && isMinCorrect && isMaxCorrect
        }
    }
})(window, window.angular);