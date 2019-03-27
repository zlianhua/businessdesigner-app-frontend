<template>
    <div>
        <div>
            <input type="image" src="/static/images/class.ico" id="btnClass" objType="Class" title="对象" @click="pressButton($event)"/>
            <input type="image" src="/static/images/abstract-class.ico" id="btnAbstractClass" objType="Class" title="抽象对象" @click="pressButton($event);">
            <input type="image" src="/static/images/external-class.ico" id="btnExternalClass" objType="Class" title="外部对象" @click="pressButton($event);">
            <span>|</span>
            <input type="image" src="/static/images/class-delete.ico" id="btnDeleteClass" title="删除业务对象" @click="deleteCell();">
            <span>|</span>
            <input type="image" src="/static/images/generalization.ico" id="btnGeneralization" objType="association" title="继承" @click="pressButton($event);">
            <input type="image" src="/static/images/association.ico" id="btnAssociation" objType="association" title="关联" @click="pressButton($event);">
            <input type="image" src="/static/images/selfAssociation.ico" id="btnSelfAssociation" objType="association" title="自关联" @click="pressButton($event);">
            <input type="image" src="/static/images/aggregation.ico" id="btnAggregation" objType="association" title="Aggregation" @click="pressButton($event);">
            <input type="image" src="/static/images/composition.ico" id="btnComposition" objType="association" title="Composition" @click="pressButton($event);">
            <span>|</span>
            <button id="newComponent" @click="newComponent()" title="新建构件"><font-awesome-icon icon="file-alt"/></button>
            <button id="save" @click="saveComponent()" title="保存构件"> <font-awesome-icon icon="save"/></button>
            <button id="open" @click="openComponent()" title="打开构件"> <font-awesome-icon icon="folder-open"/> </button>
            <button id="delete" @click="deleteComponent()" title="删除构件"><font-awesome-icon icon="trash"/></button>
            <button id="getCode" @click="getCode()" title="生成工程代码"><font-awesome-icon icon="coffee"/></button>
            <button id="zoomIn" @click="zoomIn" title="放大"><font-awesome-icon icon="search-plus"/></button>
            <button id="zoomOut" @click="zoomOut" title="缩小"><font-awesome-icon icon="search-minus"/></button>
            <button id="resetZoom" @click="resetZoom" title="恢复原大小"><font-awesome-icon icon="search"/></button>
        </div>
        <div id="paper" class="w-100"></div>
    </div>
</template>
<script>
import * as extendedClass from '../extendedClass.js';
const _ = require('lodash');
const joint = require('jointjs');
const V = joint.V;
let graph;
let paper;
let graphScale = 1;
let currentSelectButton = null;
let currentHighLight = null;
let currentElementView = null;
const uml = joint.shapes.uml;
let myHighlighter2 = {
    highlighter: {
        name: 'stroke',
        options: {
            padding: 10,
            rx: 2,
            ry: 2
        }
    }
};
export default {
    name: 'ComponentCanvas',
    props:['entityMap'],
    data(){
        return{
            currentHighLight: this.currentHighLight
        }
    },
    methods:{
        pressButton(event) {
            let button = event.target;
            if(currentSelectButton){
                if (currentSelectButton===button){
                    return;
                }else{
                    currentSelectButton.style.border="";
                }
            }
            button.style.border="inset";
            currentSelectButton = button;
        },
        paperScale(sx, sy) {
            this.paper.scale(sx, sy);
        },
        zoomOut() {
            this.graphScale -= 0.1;
            this.paperScale(this.graphScale, this.graphScale);
        },
        zoomIn() {
            this.graphScale += 0.1;
            this.paperScale(this.graphScale,this. graphScale);
        },
        resetZoom() {
            this.graphScale = 1;
            this.paperScale(this.graphScale, this.graphScale);
        },
        drawClass(classType,className,posX,posY){
            let fillColor ='#D2D2D2';
            let strokeColor='#ffffff';
            if(classType==='class'){
                fillColor='#E1FFFF';
                strokeColor='#4682b4';
            }
            let option={
                position: { x:posX  , y: posY },
                size: { width: 160, height: 80 },
                name: className,
                attrs: {}
            };
            let aNewClass;
            if(classType==="class"){
                aNewClass = new uml.Class(option);
            }else if (classType==="externalClass"){                                                                                                                                                      
                aNewClass = new uml.ExternalClass(option);
            }else if (classType==="abstractClass"){
                aNewClass = new uml.Abstract(option);
            }
            aNewClass.attributes.attrs['.uml-class-name-rect'].fill=fillColor;
            aNewClass.attributes.attrs['.uml-class-attrs-rect'].fill=fillColor;
            aNewClass.attributes.attrs['.uml-class-methods-rect'].fill=fillColor;
            aNewClass.attributes.attrs['.uml-class-name-rect'].stroke=strokeColor;
            aNewClass.attributes.attrs['.uml-class-attrs-rect'].stroke=strokeColor;
            aNewClass.attributes.attrs['.uml-class-methods-rect'].stroke=strokeColor;
            this.graph.addCell(aNewClass);
            this.$parent.entityMap.set(aNewClass.id,{id:aNewClass.id,entityName:className,type:aNewClass.get("type"),attributes:[],annotations:[]});
            return aNewClass;            
        },
        findCellById(cellId){
            var returnCell = null;
            _.each(this.graph.getCells(), function(cell) {
                if(cell.id==cellId){
                    returnCell = cell;
                    return;
                }
            });
            return returnCell;
        }
    },
    mounted(){
        this.graphScale = 1;
        this.graph = new joint.dia.Graph();
        this.paper = new joint.dia.Paper({
            el: $('#paper'),
            width: $('#paper').width(),
            height: $('#paper').height(),
            gridSize: 10,
            drawGrid: true,
            model: this.graph,
            background: {
                color: 'rgba(0, 255, 0, 0.3)'
            },
            clickThreshold: 1,
            highlighting: {
                'default': {
                    name: 'stroke',
                    options: {
                        padding: 6,
                        attrs: {
                            'stroke-width': 3,
                            stroke: '#FF6D10'
                        }
                    }
                }
            }
        });
        this.paper.options.gridSize=10;
        this.paper.drawGrid();
        this.paper.on({
            'blank:mousewheel DOMMouseScroll' : function(event){
                if(event.ctrlKey === true){
                    event.preventDefault();
                    if(event.originalEvent.wheelDelta > 0) {
                        this.zoomIn();
                    }else {
                        this.zoomOut();
                    }
                }
            },
            'blank:pointerclick' : function(evt, x, y) {
               if(this.currentHighLight){
                    this.currentHighLight.unhighlight(null, myHighlighter2);
                }
                if(currentElementView!==null){
                    currentElementView.options.interactive = true;
                }
                if(currentSelectButton){
                    let objType = currentSelectButton.getAttribute('objType');
                    if(objType && objType=="Class"){
                        var count=0;
                        for(let [k,v] of this.$parent.entityMap) {
                            if (v!==null && v.entityName.startsWith("Untitled")) {
                                var curSeq = v.entityName.replace("Untitled","");
                                if(curSeq.trim()==""){
                                    curSeq=0;
                                }else{
                                    curSeq = parseInt(curSeq);
                                }
                                curSeq=curSeq+1;
                                if(curSeq>count){
                                    count=curSeq;
                                }
                            }
                        }
                        var className="Untitled";
                        if(count>0){
                            className=className+count;
                        }
                        var classType="class";
                        if(currentSelectButton.id=="btnExternalClass"){
                            classType="externalClass";
                        }
                        if(currentSelectButton.id=="btnAbstractClass"){
                            classType="abstractClass";
                        }
                        this.drawClass(classType,className,x,y);
                    }
                }else{
                    this.$eventHub.$emit ('showComponentProperties');
                }
            },
            'blank:contextmenu' : function(evt, x, y) {
                if(null!=this.currentHighLight){
                    this.currentHighLight.unhighlight(null, this.myHighlighter2);
                }
                if(currentSelectButton){
                    currentSelectButton.style.border="";
                    currentSelectButton=null;
                }
                if(currentElementView){
                    currentElementView=null;
                }
            },
            'element:pointerdown': function(elementView, evt,x,y) {
                if(null!=this.currentHighLight){
                   this. currentHighLight.unhighlight(null, this.myHighlighter2);
                }
                elementView.highlight(null, this.myHighlighter2);
               this. currentHighLight=elementView;
                
            },
            'element:pointerup': function(elementView, evt,x,y){
                let entity = this.$parent.entityMap.get(elementView.model.id);
                this.$eventHub.$emit ('classSelected',entity);
            }    
        },this);
        $('#paper').hover(function() {
            this.focus();
        }, function() {
            this.blur();
        }).keydown(function(e) {
            if(e.keyCode == 46) {
                e.preventDefault();
                deleteCell();
            }
        });
        let _this=this;
        this.$eventHub.$on('ClassNameChanged',function(currentClass){
            let entityCell = _this.findCellById(currentClass.id);
            if(entityCell){
                entityCell.set("name",currentClass.entityName);
            }
        });
        this.$eventHub.$on('AttributesChanged',function(currentClass){
            let entityCell = _this.findCellById(currentClass.id);
            if(entityCell){
                var newAttributes=[];
                _.each(currentClass.attributes,function(attr){
                    var attrLabel = attr.name+": "+attr.type;
                    if(attr.isPrimary){
                        attrLabel+="  <pk>"
                    }
                    newAttributes[newAttributes.length] = attrLabel;
                });
                entityCell.set("attributes",newAttributes);
                var newHeight = 14*newAttributes.length;
                if(newHeight<100){
                    newHeight = 100;
                }
                if(newHeight!=entityCell.attributes.size.height){
                    entityCell.resize(entityCell.attributes.size.width,newHeight);
                }
            }
        });
    }

};
</script>

<style>
input[type="image"] {
    width:16px;
    height:16px;
}
span {
    font-size: 20px;
    position: relative; 
    display: inline-block;
    vertical-align: top;
}
#paper {
    border:1px solid black; 
    width: 800px;
    height: 600px;
    overflow: scroll;
}
</style>
