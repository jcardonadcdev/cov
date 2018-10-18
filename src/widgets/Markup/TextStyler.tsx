/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

/// <amd-dependency path='esri/widgets/ColorPicker' name='ColorPicker' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx, storeNode } from 'esri/widgets/support/widget';

import Graphic = require('esri/Graphic');

import TextSymbol = require('esri/symbols/TextSymbol');

import on = require('dojo/on');

declare const ColorPicker: any;

import * as i18n from 'dojo/i18n!./nls/Markup';

import esri = __esri;

interface TextStylerProperties extends esri.WidgetProperties {
  graphic: Graphic
}

const CSS = {
  base: 'markup-symbol-styler esri-widget',
  tabPanel: 'markup-symbol-styler__tab-panel',
  tab: 'markup-symbol-styler__tab',
  tabContent: 'markup-symbol-styler__tab-content',
  left: 'markup-symbol-styler__left-pane',
  right: 'markup-symbol-styler__right-pane',
  colorPicker: 'esri-color-picker',
  label: 'markup-symbol-styler__label',
  button: 'esri-button',
  select: 'esri-select',
  input: 'esri-input'
};

@subclass('TextStyler')
class TextStyler extends declared(Widget) {

  @property()
  graphic: Graphic;

  @aliasOf('graphic.symbol')
  symbol: TextSymbol;

  constructor(params: TextStylerProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <ul class={CSS.tabPanel} role="tablist">
          <li afterCreate={storeNode} data-node-ref="_textTab" id={this.id + "_textTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_textTab" data-content-id="_textContent" aria-selected="true">Text</li>
          <li afterCreate={storeNode} data-node-ref="_haloTab" id={this.id + "_haloTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_haloTab" data-content-id="_haloContent" aria-selected="false">Halo</li>
        </ul>
        <section afterCreate={storeNode} data-node-ref="_textContent" id={this.id + "_textContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_textTab"} role="tabcontent">
          <div class={CSS.left}>


            <span class={CSS.label}>Text</span>

            <input type="text" class={CSS.input} bind={this} afterCreate={this._textText} />



            <span class={CSS.label}>Size</span>
            <select class={CSS.select} bind={this} afterCreate={this._textSize}>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
            </select>


          </div>
          <div class={CSS.right}>
            <span class={CSS.label}>Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={this._textColorPicker}></div>
          </div>
        </section>
        <section afterCreate={storeNode} data-node-ref="_haloContent" id={this.id + "_haloContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_haloTab"} role="tabcontent" style="display:none">
          <div class={CSS.left}>
            <span class={CSS.label}>Size</span>
            <select class={CSS.select} bind={this} afterCreate={this._haloSize}>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div class={CSS.right}>
            <span class={CSS.label}>Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={this._haloColorPicker}></div>
          </div>
        </section>
      </div>
    );
  }

  // tabs
  @property()
  _textTab: HTMLElement;
  @property()
  _haloTab: HTMLElement;
  @property()
  _textContent: HTMLElement;
  @property()
  _haloContent: HTMLElement;

  private _toggleTabContent(evt: any): void {
    this._textContent.style.display = 'none';
    this._haloContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._textTab.setAttribute('aria-selected', 'false');
    this._haloTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

  // styles
  private _textText(node: HTMLSelectElement): void {
    node.value = this.symbol.text;
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.text = node.value || 'New Text';
      this.symbol = newSym;
    });
  }

  private _textSize(node: HTMLSelectElement): void {
    node.value = this.symbol.font.size.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.font.size = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _textColorPicker(node: Element): void {
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

  private _haloSize(node: HTMLSelectElement): void {
    node.value = this.symbol.haloSize.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.haloSize = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _haloColorPicker(node: Element): void {
    const cp = new ColorPicker({
      color: this.symbol.haloColor
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.haloColor = evt.color;
      this.graphic.symbol = newSym;
    });
    node.append(cp.dap_paletteContainer);
  }
}

export = TextStyler;
