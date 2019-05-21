<template>
    <b-container id="objectDiagram">
        <b-row>
            <!--draw area-->
            <b-col cols=7>
                <ComponentCanvas :entityMap="entityMap" :linkMap="linkMap"/>
            </b-col>
            <b-col cols=5>
                <ComponentEditor :entityMap ="entityMap" :linkMap="linkMap"/>
            </b-col>
        </b-row>
  </b-container>
</template>
<script>
import ComponentCanvas from '@/components/ComponentCanvas';
import ComponentEditor from '@/components/ComponentEditor';
import axios from "axios";
import cellUtil from "../cellUtil.js";
import { setTimeout } from 'timers';
const config = require('../../config/config.js');
let entityMap = new Map();
let linkMap = new Map();
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
        saveAsComponent(graph){
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
                    graph.fromJSON(JSON.parse(data.oomXml));
                    if( data.entities.length>0){
                        _this.$eventHub.$emit('classSelected',data.entities[0]);
                    }
                    _this.setComponent(data,graph.getCells());
                    alert(_this.component.simpleName+"构件另存为"+newComponentName+"成功!");
                }
            ).catch(
                function(error){
                    alert("构件另存失败。原因："+error.response.data);
                }
            ); 

        },
        saveComponent(graph){
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
                alert(rootEntityCount+ "跟对象数量只能有一个!")
                return;
            }

            if(!this.checkEntity()){
                return;
            }

            var jsonStr = JSON.stringify(graph.toJSON());
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
                    alert("构件保存失败。原因："+error.response.data);
                }
            ); 
        },
        openComponent(componentName,graph){
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
                    graph.fromJSON(JSON.parse(data.oomXml));
                    if( data.entities.length>0){
                        _this.$eventHub.$emit('classSelected',data.entities[0]);
                    }
                    _this.setComponent(data,graph.getCells());
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
        newComponent(graph){
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
            graph.clear();
            this.entityMap = new Map();
            this.linkMap = new Map();
            this.oldComponentName=null;
        },
        deleteComponent(graph){
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
                    _this.newComponent(graph);
                    alert(_this.component.simpleName+"构件删除成功!");
                }
            ).catch(
                function(error){
                    alert("构件删除失败。原因："+error.response.data);
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
                    alert(_this.component.simpleName+"代码生成失败!\n"+error.response.data);
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
            oldComponentName: oldComponentName
        }
    },
    mounted(){
        let _this = this;
        this.$eventHub.$on('openComponent',function(componentName,graph){
            _this.openComponent(componentName,graph);
        });
        this.$eventHub.$on('saveComponent',function(graph){
            _this.saveComponent(graph);
        });
        this.$eventHub.$on('saveAsComponent',function(graph,newComponentName){
            _this.saveAsComponent(graph,newComponentName);
        });
        this.$eventHub.$on('newComponent',function(graph){
            _this.newComponent(graph);
        });
        this.$eventHub.$on('deleteComponent',function(graph){   
            _this.deleteComponent(graph);
        });
        this.$eventHub.$on('generateJavaCode',function(){
            _this.generateJavaCode();
        });
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

