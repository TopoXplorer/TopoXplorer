var plugin = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'TopoXplorer:plugin',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'TopoXplorer',
          version: plugin.version,
          exports: plugin
      });
  },
  autoStart: true
};

