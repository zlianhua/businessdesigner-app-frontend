<template>
    <div class="test-container">
      <div class="editor-parent">
        <div class="editor-container"></div>
        <div class="editor-tabs"></div>
      </div>
    </div>
</template>
<script>
import axios from "axios"
import * as $ from 'jquery'
const config = require('../../config/config.js')
import DmnJS from 'dmn-js/dist/dmn-modeler.development.js'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-drd.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css'
import 'dmn-js/dist/assets/dmn-js-literal-expression.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn.css'
let dmnModeler
let CLASS_NAMES = {
    drd: 'dmn-icon-lasso-tool',
    decisionTable: 'dmn-icon-decision-table',
    literalExpression: 'dmn-icon-literal-expression'
};
let $container;
let $tabs;
let diagramUrl = 'diagram.dmn';
let baseURL = 'http://'+config.metaDataServer.host+":"+config.metaDataServer.port;
export default {
    name:'BusinessRules',
    data(){
        return {
            $container: $container,
            $tabs: $tabs,
            diagramUrl: diagramUrl,
            dmnModeler: dmnModeler,
            baseURL: baseURL
        }
    },
    methods:{
        openDiagram(dmnFileName) {
            let aUrl="/application/openRule";
            let _this=this;
            axios({
                method: 'GET',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    let dmnXML = returnValue.data;
                    // import diagram
                    _this.dmnModeler.importXML(dmnXML, function(err) {
                        if (err) {
                            return console.error('could not import DMN 1.1 diagram', err);
                        }
                        var activeEditor = _this.dmnModeler.getActiveViewer();
                        // access active editor components
                        var canvas = activeEditor.get('canvas');
                        // zoom to fit full viewport
                        canvas.zoom('fit-viewport');
                    });
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("规则打开失败。原因："+errorInfo);
                }
            );   
        }
    },
    mounted () {
        this.$container = $('.editor-container');
        this.$tabs = $('.editor-tabs');
        let _this=this;
        this.dmnModeler = new DmnJS({
            container: this.$container,
            height: 500,
            width: '100%',
            keyboard: {
                bindTo: window
            }
        });
        this.$tabs.delegate('.tab', 'click', function(e) {
            var viewIdx = parseInt(this.getAttribute('data-id'), 10);
            var view =_this.dmnModeler.getViews()[viewIdx];
            var activeView =_this.dmnModeler._getViewer(view);
            _this.dmnModeler.open(view);
            if(view.element){
                let currentDecisionTable = view.element.decisionTable;
                if(currentDecisionTable){
                    //find InputEditingProvider
                    // let input_labels = document.getElementsByClassName("input-label");
                    let modules = activeView.getModules();
                    let decisionTableHeadEditor = modules[17];
                    let inputEditingProvider = decisionTableHeadEditor.inputEditingProvider;
                    let eventBus = activeView.get('eventBus');
                    // console.log(activeView.getModules());
                    console.log(eventBus);
                    activeView.off('input.edit');
                    activeView.on('input.edit', function(eventObj) {
                        //TODO 自定义新的弹出框组件，加入属性选项
                        console.log(eventObj)
                    });
                }
            }
        });
        this.dmnModeler.on('views.changed', function(event) {
            var { views, activeView } = event;
            // clear tabs
            _this.$tabs.empty();
            views.forEach(function(v, idx) {
                const className = CLASS_NAMES[v.type];
                var tab = $(`
                    <div class="tab ${ v === activeView ? 'active' : ''}" data-id="${idx}">
                    <span class="${ className }"></span>
                    ${v.element.name || v.element.id}
                    </div>
                `);
                _this.$tabs.append(tab);
            });
        });
        this.openDiagram(this.diagramUrl)
    }
}
</script>
<style>
.dmn-js-parent {
  border: solid 1px #ccc;
}

.editor-tabs .tab {
  display: block;
  white-space: nowrap;
  background: white;
  padding: 5px;
  margin: -1px 2px 2px 2px;
  border: solid 1px #CCC;
  border-radius: 0 0 2px 2px;
  padding: 8px;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  cursor: default;
  font-size: 14px;
  color: #444;
  flex: 0 0 1%;
}

.editor-tabs {
  display: flex;
  flex-direction: row;
  position: relative;
}

.editor-tabs .tab:first-child {
  margin-left: 5px;
}

.editor-tabs .tab.active {
  border-top-color: white;
}

.editor-tabs .tab.active,
.editor-tabs .tab:hover {
  border-bottom: solid 3px #52b415;
  margin-bottom: 0;
}
</style>

