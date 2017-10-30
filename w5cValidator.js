/*! angular-w5c-validator v2.5.8 2017-10-30 */
(function(){
    var w5cValidator = angular.module("w5c.validator", ["ng"])
        .provider('w5cValidator', [function () {
            var defaultRules = {
                    required      : "该选项不能为空",
                    maxlength     : "该选项输入值长度不能大于{maxlength}",
                    minlength     : "该选项输入值长度不能小于{minlength}",
                    email         : "输入邮件的格式不正确",
                    repeat        : "两次输入不一致",
                    pattern       : "该选项输入格式不正确",
                    number        : "必须输入数字",
                    w5cuniquecheck: "该输入值已经存在，请重新输入",
                    url           : "输入URL格式不正确",
                    max           : "该选项输入值不能大于{max}",
                    min           : "该选项输入值不能小于{min}",
                    customizer    : "自定义验证不通过"

                },
                elemTypes = ['text', 'password', 'email', 'number', 'url', 'tel', 'hidden', ['textarea'], ['select'], ['select-multiple'], ['select-one'], 'radio', 'checkbox'];

            var getParentGroup = function (elem) {
                if (elem[0].tagName === "FORM" || elem[0].nodeType == 11) {
                    return null;
                }
                if (elem && elem.hasClass("form-group")) {
                    return elem;
                } else {
                    return getParentGroup(elem.parent())
                }
            };

            var validatorFn = function () {
                this.elemTypes = elemTypes;
                this.rules = {};
                this.isEmpty = function (object) {
                    if (!object) {
                        return true;
                    }
                    if (object instanceof Array && object.length === 0) {
                        return true;
                    }
                    return false;
                };
                this.defaultShowError = function (elem, errorMessages) {
                    var $elem = angular.element(elem),
                        $group = getParentGroup($elem);

                    if (!this.isEmpty($group) && !$group.hasClass("has-error")) {
                        $group.addClass("has-error");
                    }
                    var $next = $elem.next();
                    if (!$next || !$next.hasClass("w5c-error")) {
                        $elem.after('<span class="w5c-error">' + errorMessages[0] + '</span>');
                    }
                };
                this.defaultRemoveError = function (elem) {
                    var $elem = angular.element(elem),
                        $group = getParentGroup($elem);

                    if (!this.isEmpty($group) && $group.hasClass("has-error")) {
                        $group.removeClass("has-error");
                    }
                    var $next = $elem.next();
                    if ($next.hasClass && $next.hasClass("w5c-error")) {
                        $next.remove();
                    }

                };
                this.options = {
                    blurTrig   : false,
                    showError  : true,
                    removeError: true
                };
            };

            validatorFn.prototype = {
                constructor     : validatorFn,
                config          : function (options) {
                    this.options = angular.extend(this.options, options);
                },
                setRules        : function (rules) {
                    this.rules = angular.extend(this.rules, rules);
                },
                getErrorMessage : function (validationName, elem) {
                    var msgTpl = null, elementName = elem.name;
                    if (elementName && /\$\d+\$/i.test(elementName)) {
                        elementName = elementName.replace(/\$\d+\$/i, '');
                    }
                    if (!this.isEmpty(this.rules[elementName]) && !this.isEmpty(this.rules[elementName][validationName])) {
                        msgTpl = this.rules[elementName][validationName];
                    }

                    switch (validationName) {
                        case "maxlength":
                            return (msgTpl || defaultRules.maxlength).replace("{maxlength}", elem.getAttribute("ng-maxlength"));
                            break;
                        case "minlength":
                            return (msgTpl || defaultRules.minlength).replace("{minlength}", elem.getAttribute("ng-minlength"));
                            break;
                        case "max":
                            return (msgTpl || defaultRules.max).replace("{max}", elem.getAttribute("max"));
                            break;
                        case "min":
                            return (msgTpl || defaultRules.min).replace("{min}", elem.getAttribute("min"));
                        default :
                        {
                            if (msgTpl !== null) {
                                return msgTpl;
                            }
                            if (defaultRules[validationName] === null) {
                                throw new Error("该验证规则(" + validationName + ")默认错误信息没有设置！");
                            }
                            return defaultRules[validationName];
                        }

                    }
                },
                getErrorMessages: function (elem, errors) {
                    var elementErrors = [];
                    for (var err in errors) {
                        if (errors[err]) {
                            var msg = this.getErrorMessage(err, elem);
                            elementErrors.push(msg);
                        }
                    }
                    return elementErrors;
                },
                showError       : function (elem, errorMessages, options) {
                    var useOptions = angular.extend({}, this.options, options);
                    angular.element(elem).removeClass("valid").addClass("error");
                    if (useOptions.showError === false) {
                        return;
                    }
                    if (angular.isFunction(useOptions.showError)) {
                        return useOptions.showError(elem, errorMessages);
                    }
                    if (useOptions.showError === true) {
                        return this.defaultShowError(elem, errorMessages);
                    }
                },
                removeError     : function (elem, options) {
                    var useOptions = angular.extend({}, this.options, options);
                    angular.element(elem).removeClass("error").addClass("valid");
                    if (useOptions.removeError === false) {
                        return;
                    }
                    if (angular.isFunction(useOptions.removeError)) {
                        return useOptions.removeError(elem);
                    }
                    if (useOptions.removeError === true) {
                        return this.defaultRemoveError(elem);
                    }
                }
            };

            var validator = new validatorFn();

            /**
             * 配置验证属性
             * @param options
             */
            this.config = function (options) {
                validator.config(options);
            };

            /**
             * 设置验证规则，提示信息
             * @param rules
             */
            this.setRules = function (rules) {
                validator.setRules(rules);
            };

            /**
             * 设置默认规则
             * @param rules
             */
            this.setDefaultRules = function (rules) {
                defaultRules = angular.extend(defaultRules, rules);
            };

            /**
             * get method
             * @returns {validatorFn}
             */
            this.$get = function () {
                return validator;
            }
        }]);

    /* commonjs package manager support (eg componentjs) */
    if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
        module.exports = w5cValidator.name;
    }
})();
(function () {

    function W5cFormValidateCtrl($scope, $element, $attrs,
                                 w5cValidator, $parse, $timeout) {
        var _self = this;
        var _formElem = $element[0];
        this.formCtrl = null;
        // Enter 键提交
        this.needBindKeydown = false;
        this.enterKeydownFn = null;
        this.validElements = [];

        this.setElementErrorMessage = function (elemName, errorMessage) {
            var self = this;
            var elem = _formElem[elemName];
            if (elemName && self.validElements.indexOf(elemName) >= 0) {
                w5cValidator.removeError(elem, self.options);
                w5cValidator.showError(elem, [errorMessage], self.options);
                // push error message as error message displayed together
                self.formCtrl.$errors.push(errorMessage);
            }
        };

        this.validateFormElement = function (elemName) {
            var self = this;
            var elem = _formElem[elemName];
            if (!w5cValidator.isEmpty(elemName) && elem && self.formCtrl[elemName]) {
                if (w5cValidator.elemTypes.toString().indexOf(elem.type) > -1) {
                    if (self.validElements.indexOf(elemName) >= 0) {
                        if (self.formCtrl[elemName].$valid) {
                            w5cValidator.removeError(elem, self.options);
                            self.formCtrl[elemName].w5cError = false;
                        } else {
                            var elementErrors = w5cValidator.getErrorMessages(elem, self.formCtrl[elem.name].$error);
                            w5cValidator.removeError(elem, self.options);
                            self.formCtrl[elemName].w5cError = true;
                            if (elementErrors && elementErrors.length > 0) {
                                w5cValidator.showError(elem, elementErrors, self.options);
                                self.formCtrl.$errors.push(elementErrors[0]);
                            }
                            return elementErrors;
                        }
                    } else {
                        // just remove error info
                        if (!self.formCtrl[elemName].$valid) {
                            var elementErrors = w5cValidator.getErrorMessages(elem, self.formCtrl[elem.name].$error);
                            w5cValidator.removeError(elem, self.options);
                            self.formCtrl[elemName].w5cError = false;
                            if (elementErrors && elementErrors.length > 0) {
                                var errorIndex = self.formCtrl.$errors.indexOf(elementErrors[0]);
                                if (errorIndex >= 0) {
                                    self.formCtrl.$errors.splice(errorIndex, 1);
                                }
                            }
                        }
                    }

                } else {

                }
            }
            return null;
        };

        this.validateForm = function () {
            var self = this;
            var formCtrl = this.formCtrl;
            var errorMessages = [];
            //循环验证
            for (var i = 0; i < _formElem.elements.length; i++) {
                var elementErrorMessages = self.validateFormElement(_formElem.elements[i].name);
                if (elementErrorMessages && elementErrorMessages.length >= 1) {
                    errorMessages.push(elementErrorMessages[0])
                }
            }
            if (!w5cValidator.isEmpty(errorMessages) && errorMessages.length > 0) {
                formCtrl.$errors = errorMessages;
            } else {
                formCtrl.$errors = [];
            }
            if (!$scope.$$phase) {
                $scope.$apply(formCtrl.$errors);
            }
        };

        /**
         * 设置验证方法,并把 doValidate 方法挂载在 form ctrl 上
         * @param formCtrl
         */
        this.setValidate = function (formCtrl) {
            this.formCtrl = formCtrl;
            var doValidate = formCtrl.doValidate = this.validateForm.bind(this);
            formCtrl.validateElement = this.validateFormElement.bind(this);
            formCtrl.setElementErrorMessage = this.setElementErrorMessage.bind(this);
            formCtrl.reset = function () {
                $timeout(function () {
                    formCtrl.$setPristine();
                    for (var i = 0; i < _formElem.elements.length; i++) {
                        var elem = _formElem.elements[i];
                        var $elem = angular.element(elem);
                        w5cValidator.removeError($elem, _self.options);
                    }
                    formCtrl.$errors = [];
                });
            };
            // extension method for w5cValidator
            formCtrl.w5cValidator = {
                doValidate: this.validateForm.bind(this),
                validateElement: this.validateFormElement.bind(this),
                setElementErrorMessage: this.setElementErrorMessage.bind(this),
                removeElementValidation: this.removeElementValidation.bind(this),
                addElementValidation: this.addElementValidation.bind(this)
            };


            //w5cSubmit is function
            var formSubmitFn = $parse($attrs.w5cSubmit);
            if ($attrs.w5cSubmit && angular.isFunction(formSubmitFn)) {
                $element.bind("submit", function (event) {
                    doValidate();
                    if (formCtrl.$valid && angular.isFunction(formSubmitFn)) {
                        $scope.$apply(function () {
                            formSubmitFn($scope, {$event: event});
                        });
                    }
                });
                //_self.submitSuccessFn = formSubmitFn;
                this.needBindKeydown = true;
            }
            if (this.needBindKeydown) {
                $element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        var currentInput = document.activeElement;
                        if (currentInput.type && currentInput.type !== "textarea") {
                            var button = $element.find("button");
                            if (button && button[0]) {
                                button[0].focus();
                            }
                            currentInput.focus();
                            event.preventDefault();
                            if (angular.isFunction(_self.enterKeydownFn)) {
                                _self.enterKeydownFn(event);
                            }
                            //
                            // if (formCtrl.$valid && angular.isFunction(_self.submitSuccessFn)) {
                            //     $scope.$apply(function () {
                            //         _self.submitSuccessFn($scope, {$event: event});
                            //     });
                            // }
                        }
                    }
                });
            }
        };

        /**
         * 用户和其他组件交互使用, 目前有 w5cFormSubmit和w5cDynamicElement 指令调用
         * @param success 验证成功后调用函数
         * @param event 事件回调
         */
        this.doValidate = function (success, error) {
            var self = this;
            if (angular.isFunction(self.formCtrl.doValidate)) {
                self.formCtrl.doValidate();
            }
            if (self.formCtrl.$valid && angular.isFunction(success)) {
                $scope.$apply(function () {
                    success();
                });
            } else if (!self.formCtrl.$valid && angular.isFunction(error)) {
                var invalidElements = self._getInvalidElements();
                $scope.$apply(function () {
                    error(self.formCtrl.$errors, invalidElements);
                });
            }
        };

        this._getInvalidElements = function () {
            var invalidElements = [];
            for (var i = 0; i < $element[0].elements.length; i++) {
                var element = $element[0].elements[i];
                if (this.validElements.indexOf(element.name) >= 0 &&
                    this.formCtrl[element.name] &&
                    this.formCtrl[element.name].$invalid) {
                    invalidElements.push(element);
                }
            }
            return invalidElements;
        };

        /**
         * 根据 name 移除某个元素的验证
         * @param name
         */
        this.removeElementValidation = function (name) {
            var index = this.validElements.indexOf(name);
            if (index >= 0) {
                this.validElements.splice(index, 1);
                this.validateFormElement(name);
                // if (!w5cValidator.isEmpty(this.formCtrl.$errors)) {
                //     this.doValidate(angular.noop);
                // }
            }
        };

        this.addElementValidation = function (name) {
            var index = this.validElements.indexOf(name);
            if (index < 0 && _formElem[name]) {
                this.initElement(_formElem[name]);
            }
        };

        /**
         * 根据$element移除某个元素的错误信息
         * @param $elem
         */
        this.removeError = function ($elem) {
            this.formCtrl.$errors = [];
            this.formCtrl[$elem[0].name] && (this.formCtrl[$elem[0].name].w5cError = false);
            w5cValidator.removeError($elem, this.options);
        };

        /**
         * 初始化元素的验证
         * @param elem
         */
        this.initElement = function (elem) {
            var $elem = angular.element(elem);
            var ctrl = this;

            if (w5cValidator.elemTypes.toString().indexOf(elem.type) > -1 && !w5cValidator.isEmpty(elem.name) && !/^\d/.test(elem.name)) {
                var disabled = $elem.attr('disabled');
                if (disabled && (disabled === 'true' || disabled === 'disabled')) {
                    return;
                }
                //formCtrl[elem.name].$viewChangeListeners.push(function () {
                //    formCtrl.$errors = [];
                //    w5cValidator.removeError($elem, options);
                //});
                if (this.validElements.indexOf(elem.name) < 0) {
                    this.validElements.push(elem.name);
                } else {
                    return;
                }
                var $viewValueName = this.formName + "." + elem.name + ".$viewValue";
                //监控输入框的value值当有变化时移除错误信息
                //可以修改成当输入框验证通过时才移除错误信息，只要监控$valid属性即可
                $scope.$watch($viewValueName, function () {
                    ctrl.removeError($elem);
                }, true);
                //光标移走的时候触发验证信息
                if (ctrl.options && ctrl.options.blurTrig) {
                    $elem.bind("blur", function () {
                        if (!ctrl.options.blurTrig) {
                            return;
                        }
                        var element = this;
                        $timeout(function () {
                            ctrl.validateFormElement(element.name);
                            // if (!_self.formCtrl[element.name].$valid) {
                            //     var errorMessages = w5cValidator.getErrorMessages(element, _self.formCtrl[element.name].$error);
                            //     w5cValidator.showError($elem, errorMessages, _self.options);
                            //     if (_self.formCtrl[$elem[0].name]) {
                            //         _self.formCtrl[$elem[0].name].w5cError = true;
                            //     }
                            // } else {
                            //     w5cValidator.removeError($elem, _self.options);
                            // }
                        }, 50);
                    });
                }
            }
        };

        /**
         * 初始化form验证参数和内部元素
         * @private
         */
        this._init = function () {
            this.formName = $element.attr("name");
            if (!this.formName) {
                throw Error("form must has name when use w5cFormValidate");
            }
            var options = $scope.$eval($attrs.w5cFormValidate);
            if ($attrs.w5cFormValidate) {
                $scope.$watch($attrs.w5cFormValidate, function (newValue) {
                    if (newValue) {
                        _self.options = options = angular.extend({}, w5cValidator.options, newValue);
                    }
                }, true)
            }
            this.options = angular.extend({}, w5cValidator.options, options);

            //初始化验证规则，并时时监控输入值的变话
            for (var i = 0; i < $element[0].elements.length; i++) {
                this.initElement($element[0].elements[i]);
            }
        };

        this._init();
    }

    angular.module("w5c.validator")
        .directive("w5cFormValidate", [
            function () {
                return {
                    require: ['w5cFormValidate', '^?form'],
                    controller: [
                        '$scope',
                        '$element',
                        '$attrs',
                        'w5cValidator',
                        '$parse',
                        '$timeout',
                        W5cFormValidateCtrl
                    ],
                    link: function (scope, form, attr, ctrls) {
                        var ctrl = ctrls[0],
                            formCtrl = ctrls[1];

                        ctrl.setValidate(formCtrl);
                    }
                };
            }
        ])
        .directive("w5cFormSubmit", ['$parse', function ($parse) {
            return {
                require: "^w5cFormValidate",
                link: function (scope, element, attr, ctrl) {
                    var validSuccessFn = $parse(attr.w5cFormSubmit);
                    var errorCallback = $parse(attr.errorCallback);
                    var submitFn = function (event) {
                        ctrl.doValidate(function () {
                            validSuccessFn(scope, {$event: event});
                        }, function ($errors, invalidElements) {
                            if (errorCallback) {
                                errorCallback(scope, {
                                    $event: event,
                                    $errors: $errors,
                                    $invalidElements: invalidElements
                                });
                            }
                        });
                    };
                    element.bind("click", submitFn);
                    ctrl.needBindKeydown = true;
                    ctrl.enterKeydownFn = submitFn;
                }
            };
        }])
        .directive("w5cRepeat", ['$timeout', function ($timeout) {
            'use strict';
            return {
                require: ["ngModel", "^w5cFormValidate"],
                link: function (scope, elem, attrs, ctrls) {
                    $timeout(function () {
                        var otherInput = elem.inheritedData("$formController")[attrs.w5cRepeat];
                        var ngModel = ctrls[0],
                            w5cFormCtrl = ctrls[1];
                        ngModel.$parsers.push(function (value) {
                            if (value === otherInput.$modelValue) {
                                ngModel.$setValidity("repeat", true);
                            } else {
                                ngModel.$setValidity("repeat", false);
                            }
                            return value;
                        });

                        otherInput.$parsers.push(function (value) {
                            ngModel.$setValidity("repeat", value === ngModel.$modelValue);
                            if (value === ngModel.$modelValue) {
                                w5cFormCtrl.removeError(elem);
                            }
                            return value;
                        });
                    });
                }
            };
        }])
        .directive("w5cCustomizer", ['$timeout', function ($timeout) {
            'use strict';
            return {
                require: ["^form", "?ngModel"],
                link: function (scope, elem, attrs, ctrls) {
                    var ngModelCtrl = ctrls[1];
                    var $validate = function () {
                        var validate = scope.$eval(attrs.w5cCustomizer);
                        if (validate === true) {
                            ngModelCtrl.$setValidity("customizer", true);
                        } else {
                            ngModelCtrl.$setValidity("customizer", false);
                        }
                    };
                    var associate = ctrls[0][attrs.associate];
                    associate && associate.$viewChangeListeners.push($validate);
                    ngModelCtrl.$viewChangeListeners.push($validate);
                    $validate();
                }
            };
        }])
        .directive("w5cUniqueCheck", ['$timeout', '$http', 'w5cValidator', function ($timeout, $http, w5cValidator) {
            return {
                require: ["ngModel", "?^w5cFormValidate", "?^form"],
                link: function (scope, elem, attrs, ctrls) {
                    var ngModelCtrl = ctrls[0],
                        w5cFormCtrl = ctrls[1],
                        formCtrl = ctrls[2];

                    var doValidate = function () {
                        var attValues = scope.$eval(attrs.w5cUniqueCheck);
                        var url = attValues.url;
                        var isExists = attValues.isExists; //default is true
                        $http.get(url).success(function (data) {
                            var state = isExists === false ? (data == 'true' || data == true) : !(data == 'true' || data == true);
                            ngModelCtrl.$setValidity('w5cuniquecheck', state);
                            if (!state) {
                                var errorMsg = w5cValidator.getErrorMessage("w5cuniquecheck", elem[0]);
                                w5cValidator.showError(elem[0], [errorMsg], w5cFormCtrl.options);
                                if (formCtrl[elem[0].name]) {
                                    formCtrl[elem[0].name].w5cError = true;
                                }
                                if (!formCtrl.$errors) {
                                    formCtrl.$errors = [errorMsg];
                                } else {
                                    formCtrl.$errors.unshift(errorMsg);
                                }
                            }
                        });
                    };

                    ngModelCtrl.$viewChangeListeners.push(function () {
                        formCtrl.$errors = [];
                        ngModelCtrl.$setValidity('w5cuniquecheck', true);
                        if (ngModelCtrl.$invalid && !ngModelCtrl.$error.w5cuniquecheck) {
                            return;
                        }
                        if (ngModelCtrl.$dirty) {
                            doValidate();
                        }
                    });

                    var firstValue = scope.$eval(attrs.ngModel);
                    if (firstValue) {
                        if (ngModelCtrl.$invalid && !ngModelCtrl.$error.w5cuniquecheck) {
                            return;
                        }
                        doValidate();
                    }
                }
            };
        }])
        .directive('w5cDynamicName', [function () {
            return {
                restrict: 'A',
                require: "?ngModel",
                link: function (scope, elm, attrs, ngModelCtr) {
                    var _name = scope.$eval(attrs.w5cDynamicName) || attrs.w5cDynamicName;
                    if (_name) {
                        ngModelCtr.$name = _name;
                        elm.attr('name', _name);
                        var _formController = elm.controller('form') || {
                                $addControl: angular.noop
                            };
                        _formController.$addControl(ngModelCtr);
                    }
                }
            };
        }])
        .directive('w5cDynamicElement', ["$timeout", function ($timeout) {
            return {
                restrict: 'A',
                require: ["?ngModel", "?^w5cFormValidate", "?^form"],
                link: function (scope, elm, attrs, ctrls) {
                    var name = elm[0].name,
                        formCtrl = ctrls[2];
                    if (name) {
                        scope.$on("$destroy", function (e) {
                            // if formCtrl is destroyed No need to do anything
                            if (scope[formCtrl.$name]) {
                                ctrls[1].removeElementValidation(name);
                            }
                        });
                        if (!formCtrl[name]) {
                            formCtrl.$addControl(ctrls[0]);
                        }
                        var needValidate = false;
                        if (ctrls[2].$errors && ctrls[2].$errors.length > 0) {
                            needValidate = true;
                        }
                        ctrls[1].initElement(elm[0]);
                        if (needValidate) {
                            $timeout(function () {
                                ctrls[1].doValidate(angular.noop);
                            });
                        }
                    }
                }
            };
        }]);
})();