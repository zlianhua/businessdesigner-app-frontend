<template>
    <div>
        <div>
            <button id="newApplication" @click="newApplication" title="新建应用"><font-awesome-icon icon="file-alt"/></button>
            <button id="save" @click="saveApplication" title="保存应用"> <font-awesome-icon icon="save"/></button>
            <button id="saveAs" @click="saveAsApplication" title="应用另存为"> <font-awesome-icon icon="share-square"/></button>
            <button id="open" @click="openApplication" title="打开应用"> <font-awesome-icon icon="folder-open"/> </button>
            <button id="delete" @click="deleteApplication" title="删除应用"><font-awesome-icon icon="trash"/></button>
            <button id="getCode" @click="generateJavaCode" title="生成工程代码"><font-awesome-icon icon="coffee"/></button>
            <button id="getCode" @click="generateUIPages" title="生成UI代码"><font-awesome-icon icon="file-download"/></button>
        </div>
        <div>
            <ApplicationPropertyEditor :application = "application"/>
        </div>
    </div>
</template>
<script>
import ApplicationPropertyEditor from '@/components/ApplicationPropertyEditor';
import axios from "axios";
import cellUtil from "../cellUtil.js";
import { setTimeout } from 'timers';
const config = require('../../config/config.js');
let baseURL = 'http://'+config.metaDataServer.host+":"+config.metaDataServer.port;
let oldApplicationName = null;
let application = {
        name: "",
        version: "0.1-snapshot",
        componentRefs:[],
        dbType: 'MySql',
        kafkaKeySerializer: "org.apache.kafka.common.serialization.StringSerializer",
        kafkaValueSerializer: "org.springframework.kafka.support.serializer.JsonSerializer"
    };
export default {
    name: 'BusinessApplication',
    methods:{
        saveAsApplication(){
            if (!this.application.name){
                alert("请打开应用!");
                return;
            }
            let newApplicationName = prompt("请输入新应用名称：");
            if(!newApplicationName || newApplicationName.indexOf(".")<0){
                alert("应用名称必须包括包名。");
                return;
            }
            let aUrl="/application/saveAs/"+this.application.name+"/"+newApplicationName;
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
                    _this.application = returnValue.data;
                    alert(_this.application.name+"应用另存为"+newApplicationName+"成功!");
                }
            ).catch(
                function(error){
                    alert("应用另存失败。原因："+error.response.data);
                }
            ); 

        },
        saveApplication(){
            if (!this.application.name){
                alert("请新建或打开已有组件并编辑后保存!");
                return;
            }
            let aUrl="/application/create/"+this.oldApplicationName;
            let _this=this;
            console.log(this.application);
            axios({
                method: 'POST',
                baseURL: this.baseURL,
                url: aUrl,
                data: JSON.stringify(_this.application),
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    _this.oldApplicationName = _this.application.name;
                    alert(_this.application.name+"应用保存成功!");
                }
            ).catch(
                function(error){
                    alert("应用保存失败。原因："+error.response.data);
                }
            ); 
        },
        openApplication(){
            let applicationName = prompt("请输入应用名称:");
            if(!applicationName || applicationName.indexOf(".")<0){
                alert("应用名称必须包括包名。");
                return;
            }
            let _this=this;
            let aUrl='/application/open/'+applicationName;
            axios({
                method: 'GET',
                baseURL: this.baseURL,
                url: aUrl,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'text'
            }).then(
                function (returnValue) {
                    _this.application = returnValue.data;
                    _this.oldApplicationName = _this.application.name;
                }
            ).catch(
                function(error){
                    let errorInfo ="未知";
                    if(error.response){
                        errorInfo = error.response.data;
                    }else{
                        errorInfo = error;
                    }
                    alert("业务应用打开失败。原因："+errorInfo);
                }
            ); 
        },
        newApplication(graph){
            this.application ={
                name: "",
                version: "0.1-snapshot",
                components:[],
                dbType: 'MySql',
                kafkaKeySerializer: "org.apache.kafka.common.serialization.StringSerializer",
                kafkaValueSerializer: "org.springframework.kafka.support.serializer.JsonSerializer"
            }
            this.oldApplicationName=null;
        },
        deleteApplication(graph){
            if (!this.application || !this.application.name){
                alert("请先打开需要删除的应用!");
                return;
            }
            if(!confirm("您确认删除应用"+this.application.name+"吗?")){
                return;
            }
            let aUrl='/application/delete/'+this.application.name;
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
                    _this.newApplication(graph);
                    alert(_this.application.name+"应用删除成功!");
                }
            ).catch(
                function(error){
                    alert("应用删除失败。原因："+error.response.data);
                }
            ); 
        },
        generateJavaCode(){
            if (!this.application.name){
                alert("请新建或打开已有组件!");
                return;
            }

            var applicationName = this.application.name;
            let aUrl = "/application/generateWebApp/"+applicationName;
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
                    cellUtil.downloadFile(new Blob([returnValue.data]), _this.application.name+'.zip');
                    alert(_this.application.name+"代码生成成功!");
                }
            ).catch(
                function(error){
                    alert(_this.application.name+"代码生成失败!\n"+error.response.data);
                }
            ); 
        },
        generateUIPages(){
            if (!this.application.name){
                alert("请新建或打开已有组件!");
                return;
            }

            var applicationName = this.application.name;
            let aUrl = "/application/generateUIPages/"+applicationName;
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
                    cellUtil.downloadFile(new Blob([returnValue.data]), _this.application.name+'UI.zip');
                    alert(_this.application.name+"UI代码生成成功!");
                }
            ).catch(
                function(error){
                    alert(_this.application.name+"UI代码生成失败!\n"+error.response.data);
                }
            ); 
        }
    },
    data(){
        return {
            application: application,
            baseURL: baseURL,
            oldApplicationName: oldApplicationName
        }
    },
    components:{
        ApplicationPropertyEditor
    }
}
</script>
