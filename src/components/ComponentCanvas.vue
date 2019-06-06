<template>
    <div>
        <div>
            <input type="image" src="/static/images/class.ico" id="btnClass" objType="Class" title="对象" @click="pressButton($event)"/>
            <input type="image" src="/static/images/abstract-class.ico" id="btnAbstractClass" objType="Class" title="抽象对象" @click="pressButton($event);">
            <input type="image" src="/static/images/external-class.ico" id="btnExternalClass" objType="Class" title="外部对象" @click="pressButton($event);">
            <span>|</span>
            <input type="image" src="/static/images/class-delete.ico" id="btnDeleteClass" title="删除业务对象" @click="deleteCell">
            <span>|</span>
            <input type="image" src="/static/images/generalization.ico" id="btnGeneralization" objType="association" title="继承" @click="pressButton($event);">
            <input type="image" src="/static/images/association.ico" id="btnAssociation" objType="association" title="关联" @click="pressButton($event);">
            <input type="image" src="/static/images/selfAssociation.ico" id="btnSelfAssociation" objType="association" title="自关联" @click="pressButton($event);">
            <input type="image" src="/static/images/aggregation.ico" id="btnAggregation" objType="association" title="Aggregation" @click="pressButton($event);">
            <input type="image" src="/static/images/composition.ico" id="btnComposition" objType="association" title="Composition" @click="pressButton($event);">
            <span>|</span>
            <button id="newComponent" @click="newComponent" title="新建构件"><font-awesome-icon icon="file-alt"/></button>
            <button id="save" @click="saveComponent" title="保存构件"> <font-awesome-icon icon="save"/></button>
            <button id="saveAs" @click="saveAsComponent" title="构件另存为"> <font-awesome-icon icon="share-square"/></button>
            <button id="open" @click="openComponent" title="打开构件"> <font-awesome-icon icon="folder-open"/> </button>
            <button id="delete" @click="deleteComponent" title="删除构件"><font-awesome-icon icon="trash"/></button>
            <button id="getCode" @click="generateJavaCode" title="生成工程代码"><font-awesome-icon icon="coffee"/></button>
            <button id="zoomIn" @click="zoomIn" title="放大"><font-awesome-icon icon="search-plus"/></button>
            <button id="zoomOut" @click="zoomOut" title="缩小"><font-awesome-icon icon="search-minus"/></button>
            <button id="resetZoom" @click="resetZoom" title="恢复原大小"><font-awesome-icon icon="search"/></button>
        </div>
        <div id="paperScrollableWrapper">
            <div id="paper" tabindex="0"  @keydown="paperOnKeyDown"></div>
        </div>
    </div>
</template>
<script>
import * as extendedClass from '../extendedClass.js';
import axios from "axios";
import cellUtil from "../cellUtil.js";
const _ = require('lodash');
const joint = require('jointjs');
const V = joint.V;
const g = joint.g;
let graph;
let paper;
let graphScale = 1;
let currentSelectButton = null;
let currentHighLight = null;
let currentElementView = null;
const uml = joint.shapes.uml; 
let dragStartPosition;
export default {
    name: 'ComponentCanvas',
    props:['entityMap','linkMap'],
    data(){
        return{
            currentHighLight: this.currentHighLight
        }
    },
    methods:{
        openComponent(){
            let componentName = prompt("请输入构件名称:");
            if(!componentName || componentName.indexOf(".")<0){
                alert("构件名称必须包括包名。");
                return;
            }
            this.$eventHub.$emit ('openComponent',componentName,this.graph);
        },
        saveComponent(){
            this.$eventHub.$emit ('saveComponent',this.graph);
        },
        saveAsComponent(){
            this.$eventHub.$emit ('saveAsComponent',this.graph);
        },
        newComponent(){
            this.currentSelectButton=null;
            this.currentSelectCell = null;
            this.currentElementView=null;
            this.currentHighLight=null;
            this.$eventHub.$emit ('newComponent',this.graph);
        },
        deleteComponent(){
            this.$eventHub.$emit ('deleteComponent',this.graph);
        },
        generateJavaCode(){
            this.$eventHub.$emit ('generateJavaCode');
        },
        paperOnKeyDown(e){
           if(e.keyCode == 46) {
                e.preventDefault();
                this.deleteCell();
            }
        },
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
        deleteCell(){
            if(!this.currentHighLight){
                return;
            }
            var id = this.currentHighLight.model.id;
            this.entityMap.delete(id);
            for(let [k,v] of this.linkMap){
                if(v.sourceId==id || v.targetId==id){
                    this.linkMap.delete(k);
                    var link = cellUtil.findCellById(k,this.graph.getCells());
                    link.remove();
                }
            }
            this.currentHighLight.model.remove();
        },
        cellHasSelfAssociation(cellId){
            for(let[k,v] of this.linkMap){
                if (v.targetId==cellId && (v.type=="SelfAssociation")){
                    return true;
                }
            }
            return false;
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
            this.entityMap.set(aNewClass.id,
                {id:aNewClass.id,
                name:className,
                type:aNewClass.get("type"),
                attributes:[],
                annotations:[],
                commandServices:[],
                queryServices:[]
                });
            return aNewClass;            
        },
        createLinkTool(link){
            var verticesTool = new joint.linkTools.Vertices();
            var segmentsTool = new joint.linkTools.Segments();
            var boundaryTool = new joint.linkTools.Boundary();
            var removeButton = new joint.linkTools.Remove();
            let _this=this;
            var infoButton = new joint.linkTools.Button({
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 7,
                        'fill': '#001DFF',
                        'cursor': 'pointer'
                    }
                }, {
                    tagName: 'path',
                    selector: 'icon',
                    attributes: {
                        'd': 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
                        'fill': 'none',
                        'stroke': '#FFFFFF',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    }
                }],
                distance: 70,
                offset: 0,
                action: function(evt) {
                    var linkObj = _this.linkMap.get(link.id);
                    _this.$eventHub.$emit ('showLinkProperties',linkObj);
                }
            });
            var toolsView = new joint.dia.ToolsView({
                tools: [
                    verticesTool, segmentsTool,
                    boundaryTool, infoButton,removeButton
                ]
            });
            var linkView = link.findView(this.paper);
            if(linkView){
                linkView.addTools(toolsView);
                linkView.hideTools();
            }
        },
        resizeClassCell(cell){
            let newHeight = 0;
            let perLineHight = 13.5;
            if(cell.attributes.attributes){
                newHeight = newHeight + cell.attributes.attributes.length*perLineHight;
            }
            if(cell.attributes.methods){
                newHeight = newHeight + cell.attributes.methods.length*perLineHight;
            }
            if(newHeight<100){
                newHeight = 100;
            }
            if(cell.type !== "uml.Class"){
                newHeight+=60;    
            }
            if(newHeight!=cell.attributes.size.height){
                cell.resize(cell.attributes.size.width,newHeight);
            }
            if(this.currentHighLight){
                this.currentHighLight.unhighlight();
                this.currentHighLight.highlight();
            }
        },
        replaceEntityType(entity,type){
            if(type === "externalClass"){
                entity.type="uml.ExternalClass";
            }else if(type === "abstractClass"){
                entity.type="uml.Abstract";    
            }else{
                entity.type="uml.Class";  
            } 
            var oldCell=cellUtil.findCellById(entity.id,this.graph.getCells());
            var newCell=this.drawClass(type,oldCell.attributes.name,oldCell.attributes.position.x,oldCell.attributes.position.y);
            newCell.set("attributes",oldCell.get("attributes"));
            newCell.attributes.size.width=oldCell.attributes.size.width;
            newCell.attributes.size.height=oldCell.attributes.size.height;
            var oldId = entity.id;
            var newId = newCell.id;
            for(let [k,v] of this.linkMap) {
                if (v.targetId === oldId) {
                    v.targetId=newId;
                    var link = cellUtil.findCellById(k,this.graph.getCells());
                    if(link){
                        link.target({ id:newId});
                    }
                }
                if (v.sourceId === oldId) {
                    v.sourceId=newId;
                    var link = cellUtil.findCellById(k,this.graph.getCells());
                    if(link){
                        link.source({ id:newId});
                    }
                }
            }
            entity.id = newId;
            this.entityMap.delete(oldId);
            this.entityMap.set(newId,entity);
            this.deleteCell(oldCell);
            this.clickBlank();
        },
        clickBlank(){
             if(null!=this.currentHighLight){
                this.currentHighLight.unhighlight();
            }
            if(currentSelectButton){
                currentSelectButton.style.border="";
                currentSelectButton=null;
            }
            if(currentElementView){
                currentElementView=null;
            }
            this.$eventHub.$emit ('showComponentProperties');
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
            // restrictTranslate: true,
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


        this.graph.on("remove",function(cell){
            if(cell.isLink()){
                cell.remove();
                this.linkMap.delete(cell.id);
            }
        },this);
        this.paper.on({
            'link:mouseenter' : function(linkView){
                linkView.showTools();
            },
            'link:mouseleave' : function(linkView){
                linkView.hideTools();
            },
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
                    this.currentHighLight.unhighlight();
                }
                if(currentElementView!==null){
                    currentElementView.options.interactive = true;
                }
                if(currentSelectButton){
                    let objType = currentSelectButton.getAttribute('objType');
                    if(objType && objType=="Class"){
                        let count=0;
                        for(let [k,v] of this.entityMap) {
                            if (v!==null && v.name.startsWith("Untitled")) {
                                let curSeq = v.name.replace("Untitled","");
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
                        let className="Untitled";
                        if(count>0){
                            className=className+count;
                        }
                        let classType="class";
                        if(currentSelectButton.id=="btnExternalClass"){
                            classType="externalClass";
                        }
                        if(currentSelectButton.id=="btnAbstractClass"){
                            classType="abstractClass";
                        }
                        let newClass = this.drawClass(classType,className,x,y);
                    }else{
                        this.$eventHub.$emit ('showComponentProperties');
                    }
                }else{
                    this.$eventHub.$emit ('showComponentProperties');
                }
            },
            'blank:contextmenu' : function(evt, x, y) {
                this.clickBlank();
            },
            'blank:pointerdown': function(evt,x,y){
                let scale = V(this.paper.viewport).scale();
                if(scale){
                    this.dragStartPosition = { x: x * scale.sx, y: y * scale.sy};
                }else{
                    this.dragStartPosition = { x: x, y: y};
                }
            },
            'blank:pointerup': function(evt,x,y){
                this.dragStartPosition = null;
            },
            'element:pointerdown': function(elementView, evt,x,y) {
                if(null!=this.currentHighLight){
                   this. currentHighLight.unhighlight();
                }
                elementView.highlight();
                this. currentHighLight=elementView;
                if(null==currentSelectButton){
                    return;
                }else{
                    let theElement = document.getElementById(currentSelectButton.id);
                    let objType = theElement.getAttribute('objType');
                    if(objType!="association"){
                        return;
                    }
                }
                elementView.options.interactive = false;
                if(currentSelectButton.id=="btnGeneralization"){
                    let association = new uml.Generalization({ source: { id: elementView.model.id }, target: { x: x, y: y }});
                    evt.data = { link: association, x: x, y: y };
                }else if(currentSelectButton.id=="btnAssociation"){
                    let association = new uml.Association({ source: { id: elementView.model.id }, target: { x: x, y: y }});
                    evt.data = { link: association, x: x, y: y };
                    evt.data.link.appendLabel({attrs: {text: {text: '0..*',role:'sourceRole'}},position:{distance: 0.15,offset: 20}});
                    evt.data.link.appendLabel({attrs: {text: {text: '0..1',role:'targetRole'}},position:{distance: 0.85,offset: 20}});
                }else if(currentSelectButton.id=="btnSelfAssociation"){
                    if(this.cellHasSelfAssociation(elementView.model.id)){
                        return;
                    }
                    let association = new uml.Association({ source: { id: elementView.model.id }, target: { id: elementView.model.id}});
                    let position = elementView.model.attributes.position;
                    let size = elementView.model.attributes.size;
                    let centerPosX=position.x+size.width/2;
                    let centerPosY=position.y+size.height/2;
                    let vertical_1x=position.x+size.width+50;
                    let vertical_1y=centerPosY;
                    let vertical_2x=vertical_1x;
                    let vertical_2y=position.y-50;
                    let vertical_3x=centerPosX;
                    let vertical_3y=vertical_2y;
                    evt.data = { link: association, x: centerPosX, y: centerPosY};
                    let verticals = [{x:vertical_1x,y:vertical_1y},{x:vertical_2x,y:vertical_2y},{x:vertical_3x,y:vertical_3y}];
                    evt.data.link.set('source',{id:elementView.model.id});
                    evt.data.link.set('target',{id:elementView.model.id});
                    evt.data.link.set('vertices',verticals);
                    elementView.model.embed(evt.data.link);
                    let assoType = currentSelectButton.id.replace("btn","");
                    let linkObj = {
                        id:evt.data.link.id,
                        type:assoType,
                        sourceId:elementView.model.id,
                        targetId:elementView.model.id,
                        sourceName:elementView.model.name,
                        targetName:elementView.model.name
                    };
                    this.linkMap.set(evt.data.link.id,linkObj);
                    this.graph.addCell(evt.data.link);
                    elementView.options.interactive=true;
                }else if(currentSelectButton.id=="btnAggregation"){
                    let association = new uml.Aggregation({ source: { id: elementView.model.id }, target: { x: x, y: y }});
                    evt.data = { link: association, x: x, y: y };
                    evt.data.link.appendLabel({attrs: {text: {text: '0..*',role:'sourceRole'}},position:{distance: 0.15,offset: 20}});
                    evt.data.link.appendLabel({attrs: {text: {text: '1..1',role:'targetRole'}},position:{distance: 0.85,offset: 20}});
                }else if(currentSelectButton.id=="btnComposition"){
                    let association = new uml.Composition({ source: { id: elementView.model.id }, target: { x: x, y: y }});
                    evt.data = { link: association, x: x, y: y };
                    evt.data.link.appendLabel({attrs: {text: {text: '0..*',role:'sourceRole'}},position:{distance: 0.15,offset: 20}});
                    evt.data.link.appendLabel({attrs: {text: {text: '1..1',role:'targetRole'}},position:{distance: 0.85,offset: 20}});
                }
                if(currentSelectButton.id!="btnSelfAssociation"){
                    this.graph.addCell(evt.data.link);
                }
                currentElementView =elementView;
            },
            'element:pointermove': function(elementView,evt, x, y) {
                if(null==currentSelectButton){
                    return;
                }else{
                    var theElement = document.getElementById(currentSelectButton.id);
                    var objType = theElement.getAttribute('objType');
                    if(objType!="association" || currentSelectButton.id=="btnSelfAssociation"){
                        return;
                    }
                }
                evt.data.link.set('target', { x: x, y: y });
            },
            'element:pointerup': function(elementView, evt,x,y){
                this.dragStartPosition = null;
                let entity = this.entityMap.get(elementView.model.id);
                if(entity){
                    if(elementView.model.attributes.type === "uml.Abstract"){
                        entity.isAbstract = true;
                    }else{
                        entity.isAbstract = false;
                    }
                    this.$eventHub.$emit ('classSelected',entity);
                }
        
                if(null==currentSelectButton){
                    return;
                }else{
                    var theElement = document.getElementById(currentSelectButton.id);
                    var objType = theElement.getAttribute('objType');
                    if(objType!="association"||currentSelectButton.id=="btnSelfAssociation"){
                        return;
                    }
                }
                let currentElement =currentElementView.model;
                var coordinates = new g.Point(x, y);
                var elementTarget = this.graph.findModelsFromPoint(coordinates).find(function(el) {
                    return (el.id !== currentElement.id);
                });
                if (elementTarget && this.graph.getNeighbors(currentElement).indexOf(currentElement) === -1 && null!= evt.data.link) {
                    evt.data.link.target({ id: elementTarget.id });
                    this.createLinkTool(evt.data.link);
                    var labels = evt.data.link.labels();
                    var idx=0;
                    var sourceRoleLabel;
                    var targetRoleLabel;
                    _.each(labels,function(label) {
                        if(label.attrs.text.role=="sourceRole"){
                            sourceRoleLabel = label.attrs.text.text;
                        }else if (label.attrs.text.role=="targetRole"){
                            targetRoleLabel = label.attrs.text.text;
                        }
                        idx++;
                    });
                    var assoType = currentSelectButton.id.replace("btn","");
                    var linkObj = {
                        id:evt.data.link.id,
                        sourceRelationName:"",
                        targetRelationName:"",
                        type:assoType,
                        sourceId:evt.data.link.getSourceElement().id,
                        targetId:elementTarget.id,
                        sourceName:evt.data.link.getSourceElement().get("name"),
                        targetName:elementTarget.get("name"),
                        sourceRoleLabel:sourceRoleLabel,
                        targetRoleLabel:targetRoleLabel
                    };
                    this.linkMap.set(evt.data.link.id,linkObj);
                    this.graph.addCell(evt.data.link);
                    if(linkObj.type=="Generalization"){
                        var sourceEntity = this.entityMap.get(linkObj.sourceId);
                        if(sourceEntity){
                            var idx=0;
                            _.each(sourceEntity.attributes,function(attr){
                                if(attr.isPrimary){
                                    sourceEntity.attributes.splice(idx);
                                    return;
                                }
                                idx++;
                            });
                            var sourceCell=cellUtil.findCellById(linkObj.sourceId,this.graph.getCells());
                            var cellAttrs=sourceCell.get("attributes");
                            if(cellAttrs[idx]){
                                cellAttrs.splice(idx);
                                sourceCell.attributes.attributes=cellAttrs;
                                this.graph.fromJSON(graph.toJSON());
                            }
                        }
                    }
                }else{
                    evt.data.link.remove();
                }
                currentElementView.options.interactive=true;
            }    
        },this);

        let _this = this;
        this.$eventHub.$on('ClassNameChanged',function(currentClass){
            let entityCell = cellUtil.findCellById(currentClass.id,_this.graph.getCells());
            if(entityCell){
                entityCell.set("name",currentClass.name);
            }
        });
        this.$eventHub.$on('abstractChanged',function(currentClass){
            let entityCell = cellUtil.findCellById(currentClass.id,_this.graph.getCells());
            if(entityCell){
                if(currentClass.isAbstract && entityCell.attributes.type !== "uml.Abstract"){
                    _this.replaceEntityType(currentClass,"abstractClass");
                }else{
                    _this.replaceEntityType(currentClass,"class");
                }
            }
        });
        this.$eventHub.$on('AttributesChanged',function(currentClass){
            let entityCell = cellUtil.findCellById(currentClass.id,_this.graph.getCells());
            if(entityCell){
                let newAttributes=[];
                _.each(currentClass.attributes,function(attr){
                    let attrLabel = attr.name+": "+attr.type;
                    if(attr.isPrimary){
                        attrLabel+="  <pk>"
                    }
                    newAttributes[newAttributes.length] = attrLabel;
                });
                entityCell.set("attributes",newAttributes);
                _this.resizeClassCell(entityCell);
            }
        });
        this.$eventHub.$on('roleLabelChanged',function(currentLinkObj){
            let link = cellUtil.findCellById(currentLinkObj.id,_this.graph.getCells());
            let idx=0;
            if(link){
                let labels = link.labels();
                _.each(labels,function(label){
                    if(label.attrs.text.role=="sourceRole" && label.attrs.text!=currentLinkObj.sourceRoleLabel){
                        link.label(idx,{ attrs: { text: { text: currentLinkObj.sourceRoleLabel } } });
                    }else if (label.attrs.text.role=="targetRole" && label.attrs.text!=currentLinkObj.targetRoleLabel){
                        link.label(idx,{ attrs: { text: { text: currentLinkObj.targetRoleLabel } } });
                    }
                    idx++;
                });
            }
        });
        this.$eventHub.$on('serviceChanged',function(currentClass){
            let entityCell = cellUtil.findCellById(currentClass.id,_this.graph.getCells());
            if(entityCell){
                let methods=[];
                let commandServices = currentClass.commandServices;
                let queryServices = currentClass.queryServices;
                _.each(commandServices,function(commandService){
                    var methodName = commandService.name;
                    if(methodName.length>23){
                        methodName = methodName.substr(0,23)+"...";
                    }
                    methods.push(methodName);
                });
                _.each(queryServices,function(queryService){
                    var methodName = queryService.name;
                    if(methodName.length>23){
                        methodName = methodName.substr(0,23)+"...";
                    }
                    methods.push(methodName);
                });
                entityCell.set("methods",methods);
                _this.resizeClassCell(entityCell);
            }
        });
        this.$eventHub.$on('replaceToExternalEntity',function(entity){
            _this.replaceEntityType(entity,"externalClass");
        });
        this.$eventHub.$on('createLinkTool',function(link){
            _this.createLinkTool(link);
        });
        $("#paper").mousemove(function(event) {
            if (_this.dragStartPosition){
              _this.paper.translate(
                event.offsetX - _this.dragStartPosition.x, 
                event.offsetY - _this.dragStartPosition.y);
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
#paper-scrollable-wrapper {
    overflow: visible;
    width: 100%;
    height: 100%;
}

#paper {
    border: 1px solid black; 
    width: 600px;
    height: 600px;
}
</style>
