(function (window, angular, undefined) {

    'use strict';

    angular.module("ts.resizable", []).directive("tsResizable", Resizable);

    function Resizable () {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                var all = element.children('div');
                var calculated = null;
                var horizontal = attrs.direction === "horizontal";

                angular.forEach(all, function (elem, index) {
                    if (elem.getAttribute("calculated") !== null) {
                        calculated = elem;
                    }
                    if (elem.getAttribute("resizer") !== null) {
                        Resizer(elem, all[index - 1], all[index + 1], horizontal)
                    }
                });

                window.addEventListener('resize', calculateDimension, false);

                function calculateDimension () {
                    var dimension = 0;
                    angular.forEach(all, function (elem) {
                        if (elem.getAttribute("calculated") === null) {
                            dimension += horizontal ? elem.offsetWidth : elem.offsetHeight;
                        }
                    });
                    if (horizontal) {
                        calculated.style.width = (element[0].offsetWidth - dimension)  + "px";
                        console.log(element[0].offsetWidth, dimension)
                    } else {
                        calculated.style.height = (element[0].offsetHeight - dimension)  + "px";
                    }
                }
                calculateDimension();
            }
        }
    }

    function Resizer (resizerElement, prevElement, nextElement, horizontal) {
        console.log(horizontal)
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
                prevElement.style.width = (startDimension1 + event.clientX - startPosition) + 'px';
                nextElement.style.width = (startDimension2 - event.clientX + startPosition) + 'px';
            } else {
                prevElement.style.height = (startDimension1 + event.clientY - startPosition) + 'px';
                nextElement.style.height = (startDimension2 - event.clientY + startPosition) + 'px';
            }
        }

        function onMouseUp (event) {
            document.documentElement.removeEventListener('mousemove', onMouseMove, false);
            document.documentElement.removeEventListener('mouseup', onMouseUp, false);
        }
    }
})(window, window.angular);