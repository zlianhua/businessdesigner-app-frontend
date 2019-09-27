<template>
    <div>
        <button @click="addCommandService"  title="新增命令服务">
            <font-awesome-icon icon="plus"/>
        </button>
        <b-table striped  responsive :small=true :bordered=true :items="editClass.commandServices" :fields="commandServiceFields" class="my-table"
        ref="commandServicesTable" @row-clicked = "showCommandServiceDetail" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm">
            <template slot="name" slot-scope="row">
                <span tabindex="0" data-toggle="tooltip" :title="row.item.name">
                    <input type="text" class="form-control col-form-label-sm" :value = "row.item.name" @change="commandServiceNameChanged(row.item,$event)"
                    @click="showCommandServiceDetail(row.item)">
                </span>
            </template>
            <template slot="action" slot-scope="row">
                    <select v-model="row.item.action" class="form-control col-form-label-sm">
                        <option>CREATE</option>
                        <option>CREATE_WITH_MEMBER</option>
                        <option>UPDATE</option>
                        <option>CREATE_MEMBER</option>
                        <option>UPDATE_MEMBER</option>
                    </select>
            </template>    
            <template slot="publishEvent" slot-scope="row">
                <b-form-checkbox
                    v-model = "row.item.publishEvent"
                    size="sm"
                    @change="changePublishEvent(row.item,$event)"
                />
            </template>
            <template slot="eventName" slot-scope="row">
                <span tabindex="0" data-toggle="tooltip" :title="row.item.eventName">
                    <input type="text" class="form-control col-form-label-sm" :value = "row.item.eventName" v-if="row.item.publishEvent==true"
                    @change="commandServiceEventNameChanged(row.item,$event)" @click="showCommandServiceDetail(row.item)">
                </span>
            </template>
            <template slot="actions" slot-scope="row">
                <button @click="deleteCommandService(row.index)">
                <font-awesome-icon icon="trash"/>
                </button>
            </template>
        </b-table>
        <br>
        <div v-if="currentCommandService!=null">
            <b-table striped fixed responsive :small=true :bordered=true :items="currentCommandService.parameters" :fields="parameterFields"
             ref="commandServiceParameterTable" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm" class="param-table" >
                <template slot="name" slot-scope="row" class="col-sm-1">
                    <span tabindex="0" data-toggle="tooltip" :title="row.item.relateName" v-if="row.item.relateName && row.item.relateName.length>0">
                        <input ttpe="text" class="form-control col-form-label-sm" v-model="row.item.relateName" maxlength="100"/>
                    </span>
                    <span tabindex="0" data-toggle="tooltip" :title="row.item.name" v-else>
                        <input ttpe="text" class="form-control col-form-label-sm" v-model="row.item.name" maxlength="100"/>
                    </span>
                </template>
                <template slot="isParameter" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isParameter"
                        unchecked-value="false"
                        size="sm"
                        @change="isParameterChanged(row.item)"
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
import cellUtil from "../cellUtil.js";
export default {
    name:'CommandServicesEditor',
    props:['editClass','entityMap','linkMap'],
    methods:{
        addCommandService(){
            let parameters = cellUtil.createParameters(this.editClass, this.entityMap, this.linkMap);
            var method={
                name: "",
                type:"",
                action: "Update",
                publishEvent:false,
                eventName:"",
                parameters:parameters
            }
            this.editClass.commandServices.push(method);
            this.$refs.commandServicesTable.refresh();
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
        showCommandServiceDetail(item){
            this.currentCommandService = item;
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
            this.currentCommandService=item;
            let serviceName = event.target.value;
            let hasSameName=false;
            for(let service of this.editClass.commandServices){
                if(service.name.trim() === serviceName){
                    alert("服务【"+serviceName+"】已经存在，请更改！");
                    hasSameName = true;
                    break;
                }
            }
            if(hasSameName){
                event.target.value = item.name;
                return;
            }
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
        },
        isParameterChanged(item){
            if(item.isParameter){
                item.isParameter = false;
            }else{
                item.isParameter = true;
            }
        }
    },
    mounted(){
        let _this = this;
        this.$eventHub.$on('classSelected',function(currentClass){
            _this.currentCommandService = null;
        });
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
                    key: 'action',
                    label:'类型',
                    sortable: false
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
.param-table {
  max-height: 300px;
  overflow-y: auto;
}
</style>