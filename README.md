## cov
A package with widgets and helpers for use with [Esri's Javascript API](https://developers.arcgis.com/javascript/).

## Usage

Copy contents of `dist` directory to any location and let dojo know about it for use with [Esri's Javascript API](https://developers.arcgis.com/javascript/) CDN.

```javascript
(function (window) {
  'use strict';
  window.dojoConfig = {
    has: {
      'esri-featurelayer-webgl': 1
    },
    packages: [{
      name: 'cov',
      location: 'path/to/cov/'
    }]
  };
}(this));
```



`i18n` supported. Additional languages can be added, or just change the `root` values.

### Compile

Includes source `tsx` and `ts` files.

Run `npm install` and `grunt build`.

### Boilerplate

This repo is handy as a boilerplate setup for Esri JS development with Typescript.

## Available Widgets

### `Measure`

A simple measure widget for measuring length, area and geographic coordinates. Change to any common API unit. Works in 2D and 3D.

The `view` property (MapView or SceneView instance) is required. Default units and geometry/text symbols properties are optional. See `widgets/Measure.tsx` for optional properties.

This widget has no public methods.

```js
require(['app/widgets/Measure'], (Measure) => {
  const view; // MapView or SceneView instance

  // create and place the widget
  view.ui.add(new Measure({
    view: view
  }), 'top-right');
});
```

```html
<link rel="stylesheet" href="path/to/widgets/Measure/Measure.css">
```

### `editing/AttributeEditor`

Edit attributes of an edit enabled feature layer. Uses the layer's field properties to create the proper inputs by field type. Supports coded value and range domains.

The `layer` property (editable FeatureLayer instance) is required. The `fieldOptions` property is an optional field name keyed interface, which adds additional options for inputs, such as hiding a field and adding a placeholder. See `FieldOption` in `widgets/editing/AttributeEditor.tsx` or the example below for options.

The `setFeature(feature: Graphic)` method populates the form inputs with the attribute data and makes the form ready to edit. The `reset()` method is a convenience function for clearing the current feature and reseting the form.

```js
require(['app/widgets/editing/AttributeEditor'], (AttributeEditor) => {
  const layer; // FeatureLayer instance

  // create widget
  const editor = new AttributeEditor({
    layer: layer,
    fieldOptions: {
      MY_FIELD: {
        hidden: true, // no input shown
        readonly: true, // input is readonly
        required: true, // input is required - fields which are not nullable are automatically required
        placeholder: 'Enter a value' // placeholder for text and number inputs
      }
    }
  });

  // example of setting the feature via map click or reseting the widget if no feature at click location
  view.on('click', evt => {
    view.hitTest(evt).then(response => {
      if (response.results.length) {
        const filter = response.results.filter(res => {
          return res.graphic.layer === layer;
        })[0];
        if (filter && filter.graphic) {
          editor.setFeature(filter.graphic);
        } else {
          editor.reset();
        }
      }
    });
  });

  // place the widget
  view.ui.add(editor, 'top-right');
});
```

```html
<link rel="stylesheet" href="path/to/widgets/editing/AttributeEditor/AttributeEditor.css">
```
