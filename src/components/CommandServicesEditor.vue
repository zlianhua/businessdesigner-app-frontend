<template>
    <div>
        <button @click="addCommandService"  title="新增命令服务">
            <font-awesome-icon icon="plus"/>
        </button>
        <b-table striped  responsive :small=true :bordered=true :items="editClass.commandServices" :fields="commandServiceFields" class="my-table"
        ref="commandServicesTable" @row-clicked = "showCommandServiceDetail" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm">
            <template slot="name" slot-scope="row">
                <input type="text" class="form-control col-form-label-sm" :value = "row.item.name" @change="commandServiceNameChanged(row.item,$event)">
            </template>
            <template slot="publishEvent" slot-scope="row">
                <b-form-checkbox
                    v-model = "row.item.publishEvent"
                    size="sm"
                    @change="changePublishEvent(row.item,$event)"
                />
            </template>
            <template slot="eventName" slot-scope="row">
                <input type="text" class="form-control col-form-label-sm" :value = "row.item.eventName" v-if="row.item.publishEvent==true" @change="commandServiceEventNameChanged(row.item,$event)">
            </template>
            <template slot="actions" slot-scope="row">
                <button @click="deleteCommandService(row.index)">
                <font-awesome-icon icon="trash"/>
                </button>
            </template>
        </b-table>
        <br>
        <div v-if="currentCommandService!=null">
            <b-table striped  responsive :small=true :bordered=true :items="currentCommandService.parameters" :fields="parameterFields"
             head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm" class="my-table" >
                <template slot="name" slot-scope="row">
                    <label class="form-control col-form-label-sm" v-if="row.item.relateName && row.item.relateName.length>0">{{row.item.relateName}}</label>
                    <label class="form-control col-form-label-sm" v-else>{{row.item.name}}</label>
                </template>
                <template slot="isParameter" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isParameter"
                        size="sm"
                    />
                </template>
                <template slot="valueFrom" slot-scope="row">
                    <div v-if="row.item.isParameter">
                        <select v-model="row.item.valueFrom" class="form-control col-form-label-sm">
                            <option>Preset</option>
                            <option>ParameterValue</option>
                        </select>
                    </div>
                </template>
                <template slot="value" slot-scope="row">
                    <div v-if="row.item.isParameter && row.item.valueFrom=='Preset'">
                        <div v-if="row.item.enums && row.item.enums.length>0">
                            <select v-model="row.item.value" class="form-control col-form-label-sm">
                                <option v-for="option in row.item.enums" v-bind:value="option.name">
                                    {{ option.name }}
                                </option>
                            </select>
                        </div>
                        <div v-else>
                            <b-form-input class="form-control col-form-label-sm" v-model="row.item.value" />
                        </div>
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</template>
<script>
let currentCommandService;
let _this = this;
export default {
    name:'CommandServicesEditor',
    props:['editClass','entityMap','linkMap'],
    methods:{
        findParentEntity(entityId){
            for(let[k,v] of this.linkMap){
                if (v.sourceId==entityId && v.type=="Generalization"){
                    return this.entityMap.get(v.targetId);
                }
            }
            return null;
        },
        findAttributesOfSuper(entityId,attributes,isAddSuperAttr){
            let parent = this.findParentEntity(entityId);
            if(parent!=null){
                attributes=this.findAttributesOfSuper(parent.id,attributes,true);
            }
            if(isAddSuperAttr){
                let entity=this.entityMap.get(entityId);
                attributes=entity.attributes.concat(attributes);
            }
            return attributes;
        },
        findRelateEntities(entity,relateEntities){
            for(let[k,v] of this.linkMap){
                if (v.targetId==entity.id && (v.type=="Aggregation" || v.type=="Composition")){
                    let source =this.entityMap.get(v.sourceId);
                    let relateEntity = {
                        entity:source,
                        parentEntity:entity
                    }
                    relateEntities.push(relateEntity);
                    relateEntities = this.findRelateEntities(source,relateEntities);
                }
            }
            return relateEntities;
        },
        buildParentEntityName(relatesMap,relateEntity,parentEntityName){
            if(relateEntity.parentEntity){
                let parentRelateEntity = relatesMap.get(relateEntity.parentEntity.name);
                if(parentRelateEntity){
                    return this.buildParentEntityName(relatesMap,parentRelateEntity,parentEntityName);
                }
                return relateEntity.parentEntity.name+"."+parentEntityName;
            }
        },
        addCommandService(){
            var parameters = [];
            var attributes = this.editClass.attributes;
            attributes = this.findAttributesOfSuper(this.editClass.id,attributes,false);
            _.each(attributes, function(attr){
                if(!attr.isPrimary){
                    var enums=[];
                    if(attr.attrEnum){
                        enums = attr.attrEnum.enums;
                    }
                    var parameter={
                        isParameter:true,
                        relateName:"",
                        name:attr.name,
                        valueFrom:"",
                        value:"",
                        enums:enums
                    }
                    parameters.push(parameter);
                }
                
            });
            var relateEntities=[];
            relateEntities = this.findRelateEntities(this.editClass,relateEntities);
            var relatesMap = new Map();
            for(aRel of relateEntities){
                relatesMap.set(aRel.entity.name,aRel);
            }
            for(relatEntity of relateEntities){
                var parentEntityName="";
                if(relatEntity.parentEntity){
                    parentEntityName=this.buildParentEntityName(relatesMap,relatEntity,parentEntityName);
                }
                if(parentEntityName && parentEntityName!="" && !parentEntityName.endsWith(".")){
                    parentEntityName+=".";
                }
                for(attr of relatEntity.entity.attributes){
                    if(attr.isPrimary){
                        continue;
                    }
                    if(attr.name && attr.name!=""){
                        var relateName=parentEntityName+relatEntity.entity.name+"."+attr.name;
                        var enums=[];
                        if(attr.attrEnum){
                            enums = attr.attrEnum.enums;
                        }
                        var parameter={
                            isParameter:true,
                            relateName:relateName,
                            name:attr.name,
                            valueFrom:"",
                            value:"",
                            enums:enums
                        }
                        parameters.push(parameter);
                    }
                }
            }
            var method={
                name:"",
                publishEvent:false,
                eventName:"",
                parameters:parameters
            }
            this.editClass.commandServices.push(method);
            this.$refs.commandServicesTable.refresh();
            this.currentCommandService = null;
            this.currentCommandService = method;
            this.$eventHub.$emit ('serviceChanged',this.editClass);
        },
        deleteCommandService(index){
            this.editClass.commandServices.splice(index, 1);
            this.$refs.commandServicesTable.refresh();
            this.$eventHub.$emit ('serviceChanged',this.editClass);
            if(this.editClass.commandServices.length==0){
                this.currentCommandService = null;
            }else{
                let newIdx = index-1;
                this.currentCommandService = this.editClass.commandServices[newIdx];
            }
        },
        showCommandServiceDetail(commandService,index){
            this.currentCommandService = null;
            this.currentCommandService = commandService;
        },
        commandServiceEventNameChanged(item,event){
            this.currentCommandService=item;
            this.currentCommandService.eventName = event.target.value;
        },
        changePublishEvent(item,event){
            this.currentCommandService=item;
            if(!event){
                item.eventName=""; 
            }
        },
        commandServiceNameChanged(item,event){
            let serviceName = event.target.value;
            this.currentCommandService=item;
            this.currentCommandService.name = serviceName;
            if(null==this.currentCommandService.eventName || this.currentCommandService.eventName==""){
                let captilizedName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
                let serviceNameList = captilizedName.match(/[A-Z][a-z]*/g);
                if(null!=serviceNameList && serviceNameList.length>0){
                    let endStr=serviceNameList[0];
                    if (endStr.lastIndexOf("e")==endStr.length-1) {
                        endStr+="d";
                    }else {
                        endStr+="ed";
                    }
                    let eventName ="";
                    for (let i = 1; i < serviceNameList.length; i++) {
                        eventName+=serviceNameList[i];
                    }
                    eventName +=endStr+"Event";
                    let unCaptilizedName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
                    this.currentCommandService.eventName = unCaptilizedName;
                }
            }
            this.$eventHub.$emit ('serviceChanged',this.editClass);
        }
    },
    data(){
        return{
            currentCommandService: currentCommandService,
            commandServiceFields: [
                {
                    key: 'name',
                    label:'名称',
                    sortable: true
                },
                {
                    key: 'publishEvent',
                    label:'发布事件',
                    sortable: false
                },
                {
                    key: 'eventName',
                    label:'事件名',
                    sortable: false
                },
                {
                    key: 'actions',
                    label:'操作',
                    sortable: false
                }
            ],
            parameterFields:[
                {
                    key: 'name',
                    label:'属性',
                    sortable: true
                },
                {
                    key: 'isParameter',
                    label:'使用',
                    sortable: true
                },
                {
                    key: 'valueFrom',
                    label:'值来源',
                    sortable: true
                },
                {
                    key: 'value',
                    label:'数值',
                    sortable: true
                }
            ]
        }
    }
}
</script>
<style>
.my-table {
  max-height: 200px;
  overflow-y: auto;
}
</style>