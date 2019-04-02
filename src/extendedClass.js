var joint = require('jointjs');
joint.shapes.uml.Class.define('uml.ExternalClass', {
  attrs: {
    '.uml-class-name-rect': { fill: '#B1BCBE' },
    '.uml-class-attrs-rect': { fill: '#B1BCBE' },
    '.uml-class-methods-rect': { fill: '#B1BCBE' }
  }
}, {
  getClassName: function() {
    return ['<<ExternalClass>>', this.get('name')];
  }
});
joint.shapes.uml.ExternalClassView = joint.shapes.uml.ClassView;

joint.dia.Link.define('uml.Association',{
  attrs: { '.marker-target': { d: 'M 20 0 L 0 10 M 20 20 L 0 10 z'}}
});