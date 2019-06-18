<template>
    <b-container id="objectDiagram">
        <b-row>
            <b-col class="col-md-auto">
                <input type="image" src="/static/images/class.ico" id="btnClass" objType="Class" title="对象" @click="pressButton($event)"/>
                <input type="image" src="/static/images/abstract-class.ico" id="btnAbstractClass" objType="Class" title="抽象对象" @click="pressButton($event);">
                <input type="image" src="/static/images/external-class.ico" id="btnExternalClass" objType="Class" title="外部对象" @click="pressButton($event);">
                <input type="image" src="/static/images/class-delete.ico" id="btnDeleteClass" title="删除业务对象" @click="deleteCell">
            </b-col>
            <b-col class="col-md-auto">    
                <input type="image" src="/static/images/generalization.ico" id="btnGeneralization" objType="association" title="继承" @click="pressButton($event);">
                <input type="image" src="/static/images/association.ico" id="btnAssociation" objType="association" title="关联" @click="pressButton($event);">
                <input type="image" src="/static/images/selfAssociation.ico" id="btnSelfAssociation" objType="association" title="自关联" @click="pressButton($event);">
                <input type="image" src="/static/images/aggregation.ico" id="btnAggregation" objType="association" title="Aggregation" @click="pressButton($event);">
                <input type="image" src="/static/images/composition.ico" id="btnComposition" objType="association" title="Composition" @click="pressButton($event);">
            </b-col>
            <b-col class="col-md-auto">
                <button id="newComponent" @click="newComponent" title="新建构件"><font-awesome-icon icon="file-alt"/></button>
                <button id="save" @click="saveComponent" title="保存构件"> <font-awesome-icon icon="save"/></button>
                <button id="saveAs" @click="saveAsComponent" title="构件另存为"> <font-awesome-icon icon="share-square"/></button>
                <button id="open" @click="openComponent" title="打开构件"> <font-awesome-icon icon="folder-open"/> </button>
                <button id="delete" @click="deleteComponent" title="删除构件"><font-awesome-icon icon="trash"/></button>
                <button id="getCode" @click="generateJavaCode" title="生成工程代码"><font-awesome-icon icon="coffee"/></button>
            </b-col>
            <b-col class="col-md-auto">    
                <button id="zoomIn" @click="zoomIn" title="放大"><font-awesome-icon icon="search-plus"/></button>
                <button id="zoomOut" @click="zoomOut" title="缩小"><font-awesome-icon icon="search-minus"/></button>
                <button id="resetZoom" @click="resetZoom" title="恢复原大小"><font-awesome-icon icon="search"/></button>
            </b-col>
            <b-col class="col col-lg-4" style="text-align:right">
                <button @click="setPropertyArea('Max')"  title="扩展属性编辑区域"><font-awesome-icon icon="chevron-circle-left"/></button>
                <button @click="setPropertyArea('Normal')"  title="恢复默认区域大小"><font-awesome-icon icon="pause-circle"/></button>
                <button @click="setPropertyArea('Min')"  title="扩展对象编辑区域"><font-awesome-icon icon="chevron-circle-right"/></button>
            </b-col>
        </b-row>
        <div class="row">
            <!--draw area-->
            <div class="col-sm-7" id="canvasCol">
                <ComponentCanvas :graph="graph" :entityMap="entityMap" :linkMap="linkMap"/>
            </div>
            <div class="col-sm-5" id="propsCol" style="display:block">
                <ComponentEditor :entityMap ="entityMap" :linkMap="linkMap"/>
            </div>
        </div>
  </b-container>
</template>
<script>
import ComponentCanvas from '@/components/ComponentCanvas';
import ComponentEditor from '@/components/ComponentEditor';
import axios from "axios";
import cellUtil from "../cellUtil.js";
import { setTimeout } from 'timers';
const config = require('../../config/config.js');
const _ = require('lodash');
const joint = require('jointjs');
let entityMap = new Map();
let linkMap = new Map();
let graph = new joint.dia.Graph();
let component = {
    simpleName: "",
    basePackageName: "com.ai.bss",
    name: "",
    description: "",
    version: "0.1-snapshot",
    inheritanceStrategy: "TABLE_PER_CLASS",
    tablePrefix: "",
    isExtendsAbstractEntity: "false",
    entities: [],
    associations: [],
    oomXml: ""
};
let baseURL = 'http://'+config.metaDataServer.host+":"+config.metaDataServer.port;
let oldComponentName = null;
export default {
    name: 'BusinessComponent',
    methods: {
        pressButton(event){
            this.$eventHub.$emit ('pressButton',event.target);
        },
        deleteCell(){
            this.$eventHub.$emit ('deleteCell');
        },
        zoomIn(){
            this.$eventHub.$emit ('zoomIn');
        },
        zoomOut(){
            this.$eventHub.$emit ('zoomOut');
        },
        resetZoom(){
            this.$eventHub.$emit ('resetZoom');
        },
        setPropertyArea(type){
            let canvasCol = $("#canvasCol");
            let propsCol = $("#propsCol");
            if(type === 'Max'){
                canvasCol.removeClass("col-sm-11");
                propsCol.removeClass("col-sm-1");
                canvasCol.removeClass("col-sm-7");
                propsCol.removeClass("col-sm-5");
                canvasCol.addClass("col-sm-1");
                propsCol.addClass("col-sm-11");
                propsCol.show();
                this.$eventHub.$emit ('resizePaper','Min');
            }else if(type === 'Min'){
                canvasCol.removeClass("col-sm-1");
                propsCol.removeClass("col-sm-11");
                canvasCol.removeClass("col-sm-7");
                propsCol.removeClass("col-sm-5");
                canvasCol.addClass("col-sm-11");
                propsCol.addClass("col-sm-1");
                propsCol.hide();
                this.$eventHub.$emit ('resizePaper','Max');
            }else{
                canvasCol.removeClass("col-sm-1");
                propsCol.removeClass("col-sm-11");
                canvasCol.removeClass("col-sm-11");
                propsCol.removeClass("col-sm-1");
                canvasCol.addClass("col-sm-7");
                propsCol.addClass("col-sm-5");
                propsCol.show();
                this.$eventHub.$emit ('resizePaper','Normal');
            }
        },
        isComponentEntity(entity){
            for(let [k,v] of this.linkMap){
                if(v.sourceId==entity.id){
                    var target = this.entityMap.get(v.targetId);
                    if(v.type=="Aggregation" || v.type=="Composition"){
                        if(target.isRootEntity){
                            return true;
                        }else{
                            return this.isComponentEntity(target);
                        }
                    }else if(v.type=="Generalization"){
                        if(target.isRootEntity){
                            return true;
                        }else{
                            return this.isComponentEntity(target);
                        }
                    }
                }
            }
            return false;
        },
        checkEntity(){
            let _this = this;
            for(let [k,v] of this.entityMap){
                if(v.type!="uml.ExternalClass" && !v.isRootEntity){
                    if (!this.isComponentEntity(v)){
                        if(confirm("对象"+v.name+"不直接或间接属于本构件，是否替换为外部对象？")){
                            _this.$eventHub.$emit ('replaceToExternalEntity',v);
                        }else{
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        isComponentEntity(entity){
            for(let [k,v] of this.linkMap){
                if(v.sourceId==entity.id){
                    var target = this.entityMap.get(v.targetId);
                    if(v.type=="Aggregation" || v.type=="Composition"){
                        if(target.isRootEntity){
                            return true;
                        }else{
                            return this.isComponentEntity(target);
                        }
                    }else if(v.type=="Generalization"){
                        if(target.isRootEntity){
                            return true;
                        }else{
                            return this.isComponentEntity(target);
                        }
                    }
                }
            }
            return false;
        },
        saveAsComponent(){
            if (!this.component.simpleName){
                alert("请打开构件!");
                return;
            }
            let newComponentName = prompt("请输入新构件名称：");
            if(!newComponentName || newComponentName.indexOf(".")<0){
                alert("构件名称必须包括包名。");
                return;
            }
            let aUrl="/component/saveAs/"+this.component.name+"/"+newComponentName;
            let _this=this;
            axios({
                method: 'POST',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    let data = returnValue.data;
                    _this.graph.fromJSON(JSON.parse(data.oomXml));
                    if( data.entities.length>0){
                        _this.$eventHub.$emit('classSelected',data.entities[0]);
                    }
                    _this.setComponent(data,_this.graph.getCells());
                    alert(_this.component.simpleName+"构件另存为"+newComponentName+"成功!");
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("构件另存失败。原因："+errorInfo);
                }
            ); 

        },
        saveComponent(){
            if (!this.component.simpleName){
                alert("请新建或打开已有组件并编辑后保存!");
                return;
            }
            let rootEntityCount =0;
            this.component.entities=[];
            for(let [k,v] of this.entityMap){
                if(v.isRootEntity){
                    rootEntityCount++;
                }
                this.component.entities.push(v);
            }
            if(rootEntityCount==0){
                alert("请设置根对象!")
                return;
            }else if(rootEntityCount>1){
                alert("根对象数量只能有一个!")
                return;
            }

            if(!this.checkEntity()){
                return;
            }

            var jsonStr = JSON.stringify(this.graph.toJSON());
            this.component.oomXml =jsonStr;
            this.component.associations=[];
            for(let [k,v] of this.linkMap){
                this.component.associations.push(v);
            };

            let aUrl="/component/create/"+this.oldComponentName;
            let _this=this;
            axios({
                method: 'POST',
                baseURL: this.baseURL,
                url: aUrl,
                data: JSON.stringify(_this.component),
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    _this.oldComponentName = _this.component.basePackageName+"."+_this.component.simpleName
                    alert(_this.component.simpleName+"构件保存成功!");
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("构件保存失败。原因："+errorInfo);
                }
            ); 
        },
        openComponent(){
            let componentName = prompt("请输入构件名称:");
            if(!componentName || componentName.indexOf(".")<0){
                alert("构件名称必须包括包名。");
                return;
            }
            let _this=this;
            let aUrl='/component/open/'+componentName;
            axios({
                method: 'GET',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    let data = returnValue.data;
                    _this.graph.fromJSON(JSON.parse(data.oomXml));
                    if( data.entities.length>0){
                        _this.$eventHub.$emit('classSelected',data.entities[0]);
                    }
                    _this.setComponent(data,_this.graph.getCells());
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("业务构件打开失败。原因："+errorInfo);
                }
            ); 
        },
        newComponent(){
            this.component ={
                simpleName: "",
                basePackageName: "com.ai.bss",
                description: "",
                version: "0.1-snapshot",
                inheritanceStrategy: "",
                tablePrefix: "",
                isExtendsAbstractEntity: "false",
                entities: [],
                associations: [],
                oomXml: ""
            }
            this.graph.clear();
            this.entityMap = new Map();
            this.linkMap = new Map();
            this.oldComponentName=null;
            this.$eventHub.$emit ('newComponent');

        },
        deleteComponent(){
            if (!this.component || !this.component.simpleName){
                alert("请先打开需要删除的构件!");
                return;
            }
            var componentName = this.component.basePackageName+"."+this.component.simpleName;
            if(!confirm("您确认删除构件"+componentName+"吗?")){
                return;
            }
            let aUrl='/component/delete/'+componentName;
            let _this=this;
            axios({
                method: 'DELETE',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    _this.newComponent();
                    alert(_this.component.simpleName+"构件删除成功!");
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("构件删除失败。原因："+errorInfo);
                }
            ); 
        },
        generateJavaCode(){
            if (!this.component.simpleName){
                alert("请新建或打开已有组件!");
                return;
            }

            var componentName = this.component.basePackageName+"."+this.component.simpleName;
            let aUrl = "/component/generateProject/"+componentName;
            let _this= this;
            axios({
                method: 'GET',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'blob'},
                responseEncoding: 'utf8', 
                responseType: 'blob'
            }).then(
                function (returnValue) {
                    cellUtil.downloadFile(new Blob([returnValue.data]), _this.component.simpleName+'.zip');
                    alert(_this.component.simpleName+"代码生成成功!");
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert(_this.component.simpleName+"代码生成失败!\n"+errorInfo);
                }
            ); 
        },
        setComponent(data,cells){
            this.component = {
                simpleName: data.simpleName,
                basePackageName: data.basePackageName,
                name: data.basePackageName+"."+data.simpleName,
                description: data.description,
                version: data.version,
                inheritanceStrategy: data.inheritanceStrategy,
                tablePrefix:data.tablePrefix,
                isExtendsAbstractEntity: data.isExtendsAbstractEntity,
                entities: [],
                associations: [],
                oomXml: ""
            };
            this.oldComponentName = this.component.name;
            this.entityMap.clear();
            this.linkMap.clear();
            for(let entity of data.entities){
                if(!entity.name.endsWith("CharValue")){
                    var cellEntity = cellUtil.findCellById(entity.id, cells);
                    if(null!=cellEntity){
                        this.entityMap.set(entity.id,entity);
                    }
                }
            }
            for (let association of data.associations){
                var link = cellUtil.findCellById(association.id, cells);
                if(null!=link){
                    this.linkMap.set(association.id,association);
                    this.$eventHub.$emit ('createLinkTool',link);
                }
            }
            for(let entity of data.entities){
                if(entity.name.endsWith("CharValue")===false){
                    var cellEntity = cellUtil.findCellById(entity.id, cells);
                    if(null!=cellEntity){
                        let newEntity = entity;
                        cellUtil.restoreCommandServices(newEntity, this.entityMap, this.linkMap);
                        cellUtil.restoreQueryServices(newEntity, this.entityMap, this.linkMap)
                        this.entityMap.set(entity.id,newEntity);
                    }
                }
            }
        }
    },
    data(){
        return {
            component: component,
            entityMap: entityMap,
            linkMap: linkMap,
            baseURL: baseURL,
            graph: graph,
            oldComponentName: oldComponentName
        }
    },
    mounted(){
        let _this = this;
        this.$eventHub.$on('componentNameChanged',function(){
            _this.component.name = _this.component.basePackageName+"."+_this.component.simpleName;
        });     
    },
    components: {
        ComponentCanvas,
        ComponentEditor
    }
}
</script>


