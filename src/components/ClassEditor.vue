<template>
    <div>
        <b-card no-body bg-variant="light" class="col-form-label-sm" small card>
            <b-tabs card>
                <b-tab title="基本信息" active>
                    <form @submit.prevent>
                        <div class="form-group row">
                            <label for="name" class="col-sm-3 col-form-label-sm">名称:</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control col-form-label-sm" id="name" placeholder="请输入对象名称" 
                                :value = "editClass.name" @change = "nameChanged($event)" required>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="description" class="col-sm-3 col-form-label-sm">描述:</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control col-form-label-sm" id="description" placeholder="请输入对象描述" 
                                v-model = "editClass.description" required>
                            </div>
                        </div>
                       <div class="form-group row">
                            <div class="col-sm-3 col-form-label-sm">是否根对象:</div>
                            <div class="col-sm-9">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="isRootEntity" v-model = "editClass.isRootEntity">
                                </div>
                            </div>
                        </div>
                    </form>
                </b-tab>
                <b-tab title="属性">
                    <ClassPropertiesEditor :editClass = "editClass"/>
                </b-tab>
                <b-tab title="注解">
                    <AnnotationsEditor :mainClass = "editClass"/>
                </b-tab>
                <b-tab title="命令服务">
                    <CommandServicesEditor :editClass = "editClass" :entityMap="entityMap" :linkMap="linkMap"/>
                </b-tab>
                <b-tab title="查询服务">
                   <QueryServicesEditor :editClass = "editClass" :entityMap="entityMap" :linkMap="linkMap"/>
                </b-tab>
            </b-tabs>        
        </b-card>
    </div>    
</template>
<script>
import ClassPropertiesEditor from '@/components/ClassPropertiesEditor';
import AnnotationsEditor from '@/components/AnnotationsEditor';
import CommandServicesEditor from '@/components/CommandServicesEditor';
import QueryServicesEditor from '@/components/QueryServicesEditor';
import { constants } from 'fs';
export default {
    name:'ClassEditor',
    props:['editClass','entityMap','linkMap'],
    methods: {
        nameChanged(event){
            let pkIdx=0;
            let primaryAttr = this.editClass.attributes.find(function(e1){
                if(e1.isPrimary){
                    return e1;
                }
                pkIdx++;
            });
            let isGeneralizationSource=false;
            for(let[k,v] of this.linkMap){
                if (v.sourceId==this.editClass.id && v.type=="Generalization"){
                    isGeneralizationSource =true;
                    if(null!=primaryAttr) {
                        this.attrRows.splice(pkIdx);
                    }
                    return isGeneralizationSource;
                }
            }
            if(isGeneralizationSource){
                return;
            }
            let newName=event.target.value;
            let oldValue = this.editClass.name;
            if(oldValue){
                let oldKeyName = oldValue.charAt(0).toLowerCase()+oldValue.substr(1)+"Id";
                let oldAttr = this.editClass.attributes.find(function(e1){
                    if(e1.name==oldKeyName){
                        return e1;
                    }
                });
                if(oldAttr){
                    this.editClass.attributes.splice(this.editClass.attributes.indexOf(oldAttr),1);
                }
            }
            let newKeyName = newName.charAt(0).toLowerCase()+newName.substr(1)+"Id";
            let existNewKey = false;
            existNewKey = this.editClass.attributes.find(function(e1){
                if(e1.name==newKeyName){
                    return true;
                }
            });
            this.editClass.name = newName;
            if(!existNewKey){
                let newRow = {
                    name: newKeyName,
                    type: "Long",
                    description: "",
                    attrValidate:{
                        valueFrom: "",
                        valueTo: "",
                        interval: "",
                        formula: "",
                        isCustomized: false
                    },
                    isPrimary: true,
                    isCharSpec: false,
                    annotations:[],
                    attrEnum:{}
                };
                this.editClass.attributes.unshift(newRow);
            }
            this.$eventHub.$emit ('ClassNameChanged',this.editClass);
        }
    },
    components: {
        ClassPropertiesEditor,
        AnnotationsEditor,
        CommandServicesEditor,
        QueryServicesEditor
    }
}
</script>
