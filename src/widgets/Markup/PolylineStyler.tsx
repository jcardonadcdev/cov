/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

/// <amd-dependency path='esri/widgets/ColorPicker' name='ColorPicker' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx } from 'esri/widgets/support/widget';

import Graphic = require('esri/Graphic');

import SimpleLineSymbol = require('esri/symbols/SimpleLineSymbol');

import on = require('dojo/on');

declare const ColorPicker: any;

import * as i18n from 'dojo/i18n!./nls/Markup';

import esri = __esri;

interface PolylineStylerProperties extends esri.WidgetProperties {
  graphic: Graphic
}

const CSS = {
  base: 'markup-symbol-styler esri-widget',
  left: 'markup-symbol-styler__left-pane',
  right: 'markup-symbol-styler__right-pane',
  colorPicker: 'esri-color-picker',
  label: 'markup-symbol-styler__label',
  button: 'esri-button',
  select: 'esri-select'
};

@subclass('PolylineStyler')
class PolylineStyler extends declared(Widget) {

  @property()
  graphic: Graphic;

  @aliasOf('graphic.symbol')
  symbol: SimpleLineSymbol;

  constructor(params: PolylineStylerProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <div class={CSS.left}>
          <span class={CSS.label}>Style</span>
          <select class={CSS.select} bind={this} afterCreate={this._lineStyle}>
            <option value="solid">Solid</option>
            <option value="dash">Dashed</option>
            <option value="dot">Dotted</option>
            <option value="dashdot">Dash Dot</option>
          </select>
          <span class={CSS.label}>Width</span>
          <select class={CSS.select} bind={this} afterCreate={this._lineWidth}>
           <option value="1">1</option>
           <option value="2">2</option>
           <option value="3">3</option>
           <option value="4">4</option>
           <option value="5">5</option>
           <option value="6">6</option>
         </select>
        </div>
        <div class={CSS.right}>
          <span class={CSS.label}>Color</span>
          <div class={CSS.colorPicker} bind={this} afterCreate={this._lineColorPicker}></div>
        </div>
      </div>
    );
  }

  // styles
  private _lineStyle(node: HTMLSelectElement): void {
    node.value = this.symbol.style;
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.style = node.value;
      this.symbol = newSym;
    });
  }

  private _lineWidth(node: HTMLSelectElement): void {
    node.value = this.symbol.width.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.width = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _lineColorPicker(node: Element): void {
    const cp = new ColorPicker({
      color: this.symbol.color
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.color = evt.color;
      this.symbol = newSym;
    });
    node.append(cp.dap_paletteContainer);
  }
}

export = PolylineStyler;
