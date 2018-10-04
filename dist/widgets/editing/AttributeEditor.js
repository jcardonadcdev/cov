define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!./AttributeEditor/nls/AttributeEditor", "esri/Graphic", "moment/moment"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, i18n, Graphic, moment) {
    "use strict";
    var CSS = {
        base: 'attribute-editor-widget esri-widget esri-widget--panel',
        input: 'esri-input',
        select: 'esri-select',
        button: 'esri-widget--button',
        message: 'attribute-editor-widget__message'
    };
    var AttributeEditor = (function (_super) {
        __extends(AttributeEditor, _super);
        function AttributeEditor(params) {
            var _this = _super.call(this, params) || this;
            _this.updating = false;
            _this._uid = new Date().getTime();
            _this.fieldOptions = {};
            return _this;
        }
        AttributeEditor.prototype.postInitialize = function () { };
        AttributeEditor.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("form", { bind: this, onsubmit: this._updateAttributes, afterCreate: widget_1.storeNode, "data-node-ref": "formNode" },
                    widget_1.tsx("legend", null, this.layer.title),
                    widget_1.tsx("fieldset", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "fieldsetNode", disabled: true },
                        this._createFieldInputs(this.layer),
                        widget_1.tsx("button", { class: CSS.button, type: "submit" }, "Update"),
                        widget_1.tsx("span", { class: CSS.message, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "messageNode" })))));
        };
        AttributeEditor.prototype.setFeature = function (feature) {
            this._reset();
            this.feature = feature;
            this.fieldsetNode.disabled = false;
            var atts = feature.attributes;
            for (var att in atts) {
                if (atts.hasOwnProperty(att)) {
                    if (this.formNode[att]) {
                        if (this.formNode[att].type === 'date') {
                            this.formNode[att].value = moment.utc(atts[att]).format('YYYY-MM-DD');
                        }
                        else {
                            this.formNode[att].value = atts[att];
                        }
                    }
                }
            }
        };
        AttributeEditor.prototype.reset = function () {
            this.feature = null;
            this.fieldsetNode.disabled = true;
            this._reset();
        };
        AttributeEditor.prototype._reset = function () {
            this.formNode.reset();
            this._setUpdateMessage('');
        };
        AttributeEditor.prototype._createFieldInputs = function (layer) {
            var _this = this;
            var inputs = [];
            layer.fields.forEach(function (field) {
                var uid = _this._uid + '_' + field.name;
                var label = field.alias ? field.alias : field.name;
                var domain = field.domain || null;
                var options = _this.fieldOptions[field.name] || {};
                var hidden = options.hidden === true ? true : false;
                var readonly = options.readonly === true ? true : false;
                var placeholder = options.placeholder ? options.placeholder : '';
                var required = field.nullable === false || options.required === true ? true : false;
                switch (field.type) {
                    case 'oid':
                        inputs.push(widget_1.tsx("input", { type: "hidden", name: layer.objectIdField }));
                        break;
                    case 'guid':
                    case 'global-id':
                        inputs.push(widget_1.tsx("input", { type: "hidden", name: field.name }));
                        break;
                    case 'date':
                        if (hidden) {
                            inputs.push(widget_1.tsx("input", { type: "hidden", name: field.name }));
                        }
                        else {
                            inputs.push(widget_1.tsx("label", { for: uid }, label), widget_1.tsx("input", { class: CSS.input, id: uid, name: field.name, type: "date", placeholder: placeholder, required: required, readOnly: readonly }));
                        }
                        break;
                    case 'string':
                        if (hidden) {
                            inputs.push(widget_1.tsx("input", { type: "hidden", name: field.name }));
                        }
                        else {
                            inputs.push(widget_1.tsx("label", { for: uid }, label));
                            if (domain) {
                                inputs.push(widget_1.tsx("select", { class: CSS.select, id: uid, name: field.name }, _this._createCodedDomainOptions(domain)));
                            }
                            else {
                                inputs.push(widget_1.tsx("input", { class: CSS.input, id: uid, name: field.name, type: "text", maxLength: field.length, placeholder: placeholder, required: required, readOnly: readonly }));
                            }
                        }
                        break;
                    case 'small-integer':
                    case 'integer':
                    case 'long-integer':
                        if (hidden) {
                            inputs.push(widget_1.tsx("input", { type: "hidden", name: field.name }));
                        }
                        else {
                            var min = 'any';
                            var max = 'any';
                            inputs.push(widget_1.tsx("label", { for: uid }, label));
                            if (domain) {
                                min = domain['minValue'];
                                max = domain['maxValue'];
                            }
                            inputs.push(widget_1.tsx("input", { class: CSS.input, id: uid, name: field.name, type: "number", step: "1", min: min, max: max, placeholder: placeholder, required: required, readOnly: readonly }));
                        }
                        break;
                    case 'double':
                        if (hidden) {
                            inputs.push(widget_1.tsx("input", { type: "hidden", name: field.name }));
                        }
                        else {
                            inputs.push(widget_1.tsx("label", { for: uid }, label), widget_1.tsx("input", { class: CSS.input, id: uid, name: field.name, type: "number", step: "any", placeholder: placeholder, required: required, readOnly: readonly }));
                        }
                        break;
                    default:
                        break;
                }
            });
            return inputs;
        };
        AttributeEditor.prototype._createCodedDomainOptions = function (domain) {
            var options = [];
            domain.codedValues.forEach(function (codedValue) {
                options.push(widget_1.tsx("option", { value: codedValue.code }, codedValue.name));
            });
            return options;
        };
        AttributeEditor.prototype._updateAttributes = function (evt) {
            var _this = this;
            evt.preventDefault();
            if (this.updating) {
                return;
            }
            this.updating = true;
            var updateFeature = new Graphic({
                attributes: {}
            });
            this.layer.fields.forEach(function (field) {
                if (_this.formNode[field.name]) {
                    var value = _this.formNode[field.name].value;
                    if (value) {
                        if (field.type === 'oid' || field.type === 'small-integer' || field.type === 'integer' || field.type === 'long-integer') {
                            value = parseInt(value, 10);
                        }
                        if (field.type === 'double') {
                            value = parseFloat(value);
                        }
                    }
                    else {
                        value = null;
                    }
                    updateFeature.attributes[field.name] = value;
                }
            });
            this.layer.applyEdits({
                updateFeatures: [updateFeature]
            }).then(function (response) {
                _this.updating = false;
                var result = response.updateFeatureResults[0];
                if (result.error) {
                    _this._setUpdateMessage(result.error.message, 'fail');
                }
                else {
                    _this._setUpdateMessage(i18n.updateSuccess, 'success');
                }
            }).catch(function (error) {
                console.log(error);
                _this.updating = false;
                _this._setUpdateMessage(i18n.updateError, 'fail');
            });
        };
        AttributeEditor.prototype._setUpdateMessage = function (message, type) {
            var node = this.messageNode;
            node.classList.remove('success');
            node.classList.remove('fail');
            node.innerHTML = message;
            if (type) {
                node.classList.add(type);
            }
        };
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "layer", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "feature", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "updating", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "formNode", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "fieldsetNode", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "messageNode", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "_uid", void 0);
        __decorate([
            decorators_1.property()
        ], AttributeEditor.prototype, "fieldOptions", void 0);
        AttributeEditor = __decorate([
            decorators_1.subclass('editing.AttributeEditor')
        ], AttributeEditor);
        return AttributeEditor;
    }(decorators_1.declared(Widget)));
    return AttributeEditor;
});
//# sourceMappingURL=AttributeEditor.js.map