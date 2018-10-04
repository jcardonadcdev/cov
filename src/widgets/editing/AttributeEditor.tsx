/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { renderable, tsx, storeNode } from 'esri/widgets/support/widget';

import * as i18n from 'dojo/i18n!./AttributeEditor/nls/AttributeEditor';

import FeatureLayer = require('esri/layers/FeatureLayer');
import Graphic = require('esri/Graphic');
import Field = require('esri/layers/support/Field');
import Domain = require('esri/layers/support/Domain');
import CodedValueDomain = require('esri/layers/support/CodedValueDomain');
import RangeDomain = require('esri/layers/support/RangeDomain');

import moment = require('moment/moment');

import esri = __esri;

interface FieldOption {
  placeholder?: string;
  hidden?: boolean;
  readonly?: boolean;
  required?: boolean;
  calculate?: Function;
}

interface AttributeEditorProperties extends esri.WidgetProperties {
  layer: FeatureLayer;
  fieldOptions?: {
    [key: string]: FieldOption
  };
}

const CSS = {
  base: 'attribute-editor-widget esri-widget esri-widget--panel',
  input: 'esri-input',
  select: 'esri-select',
  button: 'esri-widget--button',
  message: 'attribute-editor-widget__message'
};

@subclass('editing.AttributeEditor')
class AttributeEditor extends declared(Widget) {

  @property()
  layer: FeatureLayer;

  @property()
  feature?: Graphic | null;

  @property()
  updating: boolean = false;

  @property()
  formNode: HTMLFormElement;

  @property()
  fieldsetNode: HTMLInputElement;

  @property()
  messageNode: HTMLElement;

  @property()
  _uid: number = new Date().getTime();

  @property()
  fieldOptions: {
    [key: string]: FieldOption
  } = {};

  constructor(params: AttributeEditorProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <form bind={this} onsubmit={this._updateAttributes} afterCreate={storeNode} data-node-ref="formNode">
          <legend>{this.layer.title}</legend>
          <fieldset bind={this} afterCreate={storeNode} data-node-ref="fieldsetNode" disabled>
            {this._createFieldInputs(this.layer)}
            <button class={CSS.button} type="submit">Update</button>
            <span class={CSS.message} bind={this} afterCreate={storeNode} data-node-ref="messageNode"></span>
          </fieldset>
        </form>
      </div>
    );
  }

/**
 * Set the feature to edit.
 * @param feature - feature graphic
 */
  setFeature(feature: Graphic): void {
    this._reset();
    this.feature = feature;
    this.fieldsetNode.disabled = false;
    const atts = feature.attributes;
    for (var att in atts) {
      if (atts.hasOwnProperty(att)) {
        if (this.formNode[att]) {
          if (this.formNode[att].type === 'date') {
            this.formNode[att].value = moment.utc(atts[att]).format('YYYY-MM-DD');
          } else {
            this.formNode[att].value = atts[att];
          }
        }
      }
    }
  }
  /**
   * Reset the widget.
   */
  reset(): void {
    this.feature = null;
    this.fieldsetNode.disabled = true;
    this._reset();
  }

  private _reset(): void {
    this.formNode.reset();
    this._setUpdateMessage('');
  }

  private _createFieldInputs(layer: FeatureLayer) : any[] {
    const inputs: any[] = [];
    layer.fields.forEach(field  => {
      const uid = this._uid + '_' + field.name;
      const label = field.alias ? field.alias : field.name;
      const domain = field.domain || null;
      const options = this.fieldOptions[field.name] || {};
      const hidden = options.hidden === true ? true : false;
      const readonly = options.readonly === true ? true : false;
      const placeholder = options.placeholder ? options.placeholder : '';
      const required = field.nullable === false || options.required === true ? true : false;
      // create inputs by field type
      switch (field.type) {
        case 'oid':
          inputs.push(<input type="hidden" name={layer.objectIdField} />);
          break;
        case 'guid':
        case 'global-id':
          inputs.push(<input type="hidden" name={field.name} />);
          break;
        case 'date':
          if (hidden) {
            inputs.push(<input type="hidden" name={field.name} />);
          } else {
            inputs.push(
              <label for={uid}>{label}</label>,
              <input class={CSS.input} id={uid} name={field.name} type="date" placeholder={placeholder} required={required} readOnly={readonly} />
            );
          }
          break;
        case 'string':
          if (hidden) {
            inputs.push(<input type="hidden" name={field.name} />);
          } else {
            inputs.push(<label for={uid}>{label}</label>);
            if (domain) {
              inputs.push(<select class={CSS.select} id={uid} name={field.name}>{this._createCodedDomainOptions(domain as CodedValueDomain)}</select>);
            } else {
              inputs.push(<input class={CSS.input} id={uid} name={field.name} type="text" maxLength={field.length} placeholder={placeholder} required={required} readOnly={readonly} />);
            }
          }
          break;
        case 'small-integer':
        case 'integer':
        case 'long-integer':
          if (hidden) {
            inputs.push(<input type="hidden" name={field.name} />);
          } else {
            let min = 'any';
            let max = 'any';
            inputs.push(<label for={uid}>{label}</label>);
            if (domain) { // kinda wonky but can't get around tslint on RangeDomain
              min = domain['minValue'];
              max = domain['maxValue'];
            }
            inputs.push(<input class={CSS.input} id={uid} name={field.name} type="number" step="1" min={min} max={max} placeholder={placeholder} required={required} readOnly={readonly} />);
          }
          break;
        case 'double':
          if (hidden) {
            inputs.push(<input type="hidden" name={field.name} />);
          } else {
            inputs.push(
              <label for={uid}>{label}</label>,
              <input class={CSS.input} id={uid} name={field.name} type="number" step="any" placeholder={placeholder} required={required} readOnly={readonly} />
            );
          }
          break;
        default:
          break;
      }
    });
    return inputs;
  }

  private _createCodedDomainOptions(domain: CodedValueDomain) : any[] {
    const options: any[] = [];
    domain.codedValues.forEach(codedValue => {
      options.push(
        <option value={codedValue.code}>{codedValue.name}</option>
      );
    });
    return options;
  }

  private _updateAttributes(evt: any): void {
    evt.preventDefault();
    if (this.updating) {
      return;
    }
    this.updating = true;
    const updateFeature = new Graphic({
      attributes: {}
    });
    this.layer.fields.forEach(field => {
      if (this.formNode[field.name]) {
        let value = this.formNode[field.name].value;
        if (value) { // zero should pass thru as a string..."0"
          if (field.type === 'oid' || field.type === 'small-integer' || field.type === 'integer' || field.type === 'long-integer') {
            value = parseInt(value, 10);
          }
          if (field.type === 'double') {
            value = parseFloat(value);
          }
        } else {
          value = null;
        }
        updateFeature.attributes[field.name] = value;
      }
    });
    this.layer.applyEdits({
      updateFeatures: [updateFeature]
    }).then(response => {
      // console.log(response);
      this.updating = false;
      const result = response.updateFeatureResults[0];
      if (result.error) {
        this._setUpdateMessage(result.error.message, 'fail');
      } else {
        this._setUpdateMessage(i18n.updateSuccess, 'success');
      }
    }).catch(error => {
      console.log(error);
      this.updating = false;
      this._setUpdateMessage(i18n.updateError, 'fail');
    });
  }

  private _setUpdateMessage(message: string, type?: 'success' | 'fail') : void {
    const node = this.messageNode;
    node.classList.remove('success');
    node.classList.remove('fail');
    node.innerHTML = message;
    if (type) {
      node.classList.add(type);
    }
  }
}

export = AttributeEditor;
