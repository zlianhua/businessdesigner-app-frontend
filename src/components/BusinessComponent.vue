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
import Vue from 'vue';
import axios from "axios";
import cellUtil from "../cellUtil.js";
import { setTimeout } from 'timers';
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
    extendsAbstractEntity: "false",
    entities: [],
    associations: [],
    oomXml: ""
};
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
                    if (!isComponentEntity(v)){
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
                this.component.entities[this.component.entities.length] = v;
            }
            if(rootEntityCount==0){
                alert("请设置根对象!")
                return;
            }else if(rootEntityCount>1){
                alert(rootEntityCount+ "跟对象数量只能有一个!")
                return;
            }

            if(!checkEntity()){
                return;
            }

            var jsonStr = JSON.stringify(graph.toJSON());
            this.component.oomXml =jsonStr;
            this.component.associations=[];
            for(let [k,v] of this.linkMap){
                this.component.associations[component.associations.length] = v;
            };
            let aUrl="/component/create";
            let _this=this;
            axios({
                method: 'POST',
                baseURL: 'http://localhost:8083',
                url: aUrl,
                data: JSON.stringify(_this.component),
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'json'
            }).then(
                function (returnValue) {
                    alert(_this.component.simpleName+"构件保存成功!");
                }
            ).catch(
                function(error){
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    alert(_this.component.simpleName+"构件保存失败!\n"+error.responseText);
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
                extendsAbstractEntity: "false",
                entities: [],
                associations: [],
                oomXml: ""
            }
            this.entityMap = new Map();
            this.linkMap = new Map();
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
                baseURL: 'http://localhost:8083',
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'json'
            }).then(
                function (returnValue) {
                    alert(_this.component.simpleName+"构件删除成功!");
                }
            ).catch(
                function(error){
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    alert(_this.component.simpleName+"构件删除失败!\n"+error.responseText);
                }
            ); 
        },
        generateJavaCode(){
            if (!this.component.simpleName){
                alert("请新建或打开已有组件!");
                return;
            }
            var componentName = this.component.basePackageName+"."+this.component.simpleName;
            var form=$("<form>");//定义一个form表单
            form.attr("style","display:none");
            form.attr("method","get");
            form.attr("action","/component/generateProject/"+componentName);//请求url
            var input1=$("<input>");
            input1.attr("type","hidden");
            $("body").append(form);//将表单放置在web中
            form.append(input1);
            form.submit();//表单提交
        },
        setComponent(param){
            let data =param.data;
            component = {
                simpleName: data.simpleName,
                basePackageName: data.basePackageName,
                name: data.name,
                description: data.description,
                version: data.version,
                inheritanceStrategy: data.inheritanceStrategy,
                tablePrefix:data.tablePrefix,
                extendsAbstractEntity: data.extendsAbstractEntity,
                entities: [],
                associations: [],
                oomXml: ""
            };
            for(let entity of param.data.entities){
                if(!entity.name.endsWith("CharValue")){
                    var cellEntity = cellUtil.findCellById(entity.id, param.cells);
                    if(null!=cellEntity){
                        this.entityMap.set(entity.id,entity);
                    }
                }
            }
            for (let association of data.associations){
                var link = cellUtil.findCellById(association.id, param.cells);
                if(null!=link){
                    this.linkMap.set(association.id,association);
                    this.$eventHub.$emit ('createLinkTool',link);
                }
            }
            for(let entity of param.data.entities){
                if(entity.name.endsWith("CharValue")===false){
                    var cellEntity = cellUtil.findCellById(entity.id, param.cells);
                    if(null!=cellEntity){
                        let newEntity = entity;
                        cellUtil.restoreCommandServices(newEntity, this.entityMap, this.linkMap);
                        cellUtil.restoreQueryServices(newEntity, entity.queryServices, this.entityMap, this.linkMap)
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
            linkMap: linkMap
        }
    },
    mounted(){
        let _this = this;
        this.$eventHub.$on('setComponent',function(data){
            _this.setComponent(data);
        });
        this.$eventHub.$on('saveComponent',function(){
            _this.saveComponent();
        });
        this.$eventHub.$on('newComponent',function(){
            _this.newComponent();
        });
        this.$eventHub.$on('deleteComponent',function(){   
            _this.deleteComponent();
        });
        this.$eventHub.$on('generateJavaCode',function(){
            _this.generateJavaCode();
        });        
    },
    components: {
        ComponentCanvas,
        ComponentEditor
    }
}
</script>

