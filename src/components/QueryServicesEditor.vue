<template>
    <div>
        <button @click="addQueryService"  title="新增查询服务">
            <font-awesome-icon icon="plus"/>
        </button>
        <b-form-checkbox
            id="findAll"
            @change.native="addQueryAllMethod"
        >findAll服务
        </b-form-checkbox>
        <b-form-checkbox
            id="findByIdIn"
            @change.native="addFindByIdIn"
        >findByIdIn服务
        </b-form-checkbox>
        <b-table striped responsive :small=true :bordered=true :items="editClass.queryServices" :fields="queryServiceFields" class="my-table"
        ref="queryServicesTable" @row-clicked = "showQueryServiceDetail" head-letiant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm">
            <template slot="name" slot-scope="row">
                <span tabindex="0" data-toggle="tooltip" :title="row.item.name" style="white-space:nowrap">
                    <label class="form-control col-form-label-sm" nowrap>{{row.item.name}}</label>
                </span>
            </template>
            <template slot="isCreateQueryModel" slot-scope="row">
                <b-form-checkbox
                    v-model = "row.item.isCreateQueryModel" 
                    size="sm"
                />
            </template>
            <template slot="isTypeQuery" slot-scope="row">
                <b-form-checkbox
                    v-model = "row.item.isTypeQuery" 
                    size="sm"
                    @change.native="changeTypeQuery(row.item)"
                />
            </template>
            <template slot="actions" slot-scope="row">
                <button @click="deleteQueryService(row.index)">
                <font-awesome-icon icon="trash"/>
                </button>
            </template>
        </b-table>
        <br>
        <div v-if="currentQueryService!=null">
            <b-table striped fixed responsive :small=true :bordered=true :items="currentQueryService.parameters" :fields="parameterFields"
             head-letiant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm" class="param-table" >
                <template slot="name" slot-scope="row">
                    <span tabindex="0" data-toggle="tooltip" :title="row.item.name">
                        <label class="form-control col-form-label-sm">{{row.item.name}}</label>
                    </span>
                </template>
                <template slot="isParameter" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isParameter" 
                        size="sm" @change.native="refreshQueryServiceName(row.item,$event,true)"
                    />
                </template>
                <template slot="isNullable" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isNullable" 
                        size="sm"
                    />
                </template>
                <template slot="condition" slot-scope="row">
                    <div v-if="row.item.isParameter">
                        <b-form-select v-if ="row.item.type === 'String'"
                            :options="stringConditionOptions" @change.native="conditionChanged(row.item,$event)"
                            v-model = "row.item.condition" class="form-control col-form-label-sm">
                        </b-form-select>
                        <b-form-select v-else-if ="row.item.type==='Long' || row.item.type === 'long' || row.item.type === 'Integer' || row.item.type === 'int'" 
                            :options="integerConditionOptions" @change.native="conditionChanged(row.item,$event)"
                            v-model = "row.item.condition" class="form-control col-form-label-sm">
                        </b-form-select>
                        <b-form-select v-else-if ="row.item.type === 'Timestamp'"
                            :options="timestampConditionOptions" @change.native="conditionChanged(row.item,$event)"
                            v-model = "row.item.condition" class="form-control col-form-label-sm">
                        </b-form-select>
                        <b-form-select v-else-if ="row.item.type === 'Boolean' || row.item.type === 'boolean'" 
                            :options="booleanConditionOptions" @change.native="conditionChanged(row.item,$event)"
                            v-model = "row.item.condition" class="form-control col-form-label-sm">
                        </b-form-select>
                        <b-form-select v-else 
                            :options="blankConditionOptions" @change.native="conditionChanged(row.item,$event)"
                            v-model = "row.item.condition" class="form-control col-form-label-sm">
                        </b-form-select>
                    </div>
                </template>
                <template slot="relation" slot-scope="row">
                    <div v-if="row.item.isParameter">
                        <select v-model="row.item.relation" class="form-control col-form-label-sm" @change="refreshQueryServiceName(row.item,$event)">
                            <option></option>
                            <option>And</option>
                            <option>Or</option>
                        </select>
                    </div>
                </template>
                <template slot="sort" slot-scope="row">
                    <select v-model="row.item.sort" class="form-control col-form-label-sm" @change="refreshQueryServiceName(row.item,$event)">
                        <option></option>
                        <option>Desc</option>
                        <option>Asc</option>
                    </select>
                </template>
            </b-table>
        </div>
    </div>    
</template>
<script>
let currentQueryService = null;
let _this = this;
import cellUtil from "../cellUtil.js";
export default {
    name:'QueryServicesEditor',   
    props:['editClass','entityMap','linkMap'],
    methods:{
        addQueryService:function(){
            let parameters = [];
            let attributes = this.editClass.attributes;
            attributes = cellUtil.findAttributesOfSuper(this.editClass.id,attributes,false,this.entityMap, this.linkMap);
            let hasSelfAsso = cellUtil.hasSelfAssociation(this.editClass.id, this.linkMap);
            let parentAttrName;
            let primaryAttr = cellUtil.findPrimaryAttr(this.editClass,this.entityMap, this.linkMap);
            if(hasSelfAsso){
                parentAttrName="parent"+cellUtil.capitalize(this.editClass.name);
            }
            let hasParentParam = false;
            let primaryAttrIdx=-1;
            for(let attr of attributes){
                if(!attr.type && attr.attrEnum){
                    attr.type = attr.attrEnum.dataType;
                }
                if(attr.name && attr.name!=""){
                    let parameter={
                        name:attr.name,
                        type:attr.type,
                        isParameter:false,
                        condition:"",
                        relation:"",
                        sort:"",
                        isNullable:false
                    }
                    parameters.push(parameter);
                    if(attr.name === parentAttrName){
                        hasParentParam =true
                    }
                }
            }
            if(hasSelfAsso && !hasParentParam){
                let parameter={
                    name:parentAttrName,
                    type:primaryAttr.type,
                    isParameter:false,
                    condition:"",
                    relation:"",
                    sort:"",
                    isNullable:false
                }
                parameters.push(parameter);
            }
            let method={
                name:"",
                isCreateQueryModel: false,
                isTypeQuery: false,
                parameters:parameters
            }
            this.editClass.queryServices.push(method);
            this.currentQueryService = method;
            this.$refs.queryServicesTable.refresh();
        },
        addQueryAllMethod(event){
            let isAddFindAll = event.target.value;
            let hasQueryAll = false;
            let idx = -1
            let count = 0
            for(let querySrv of this.editClass.queryServices){
                if (querySrv.name==="findAll()"){
                    hasQueryAll = true
                    idx = count
                    break;
                }
                count++;
            }
            if(isAddFindAll){
                if(hasQueryAll){
                    alert("findAll服务已存在!")
                    return;
                }
               let method={
                    name:"findAll()",
                    isCreateQueryModel: false,
                    isTypeQuery: false,
                    parameters:[]
                }
                this.editClass.queryServices.push(method); 
                this.currentQueryService = method;
                this.$eventHub.$emit ('serviceChanged',this.editClass);
                this.$refs.queryServicesTable.refresh(); 
            }

            if(!isAddFindAll && hasQueryAll && idx>=0){
               this.deleteQueryService(idx);
               this.$eventHub.$emit ('serviceChanged',this.editClass);
               this.$refs.queryServicesTable.refresh(); 
            }
        
        },
        addFindByIdIn(event){
            let isAddFindByIdIn = event.target.value;
            let hasFindByIdIn = false;
            let idx = -1
            let count = 0
            let primaryAttr = cellUtil.findPrimaryAttr(this.editClass,this.entityMap, this.linkMap);
            let findByIdInMethodName = "findBy"+cellUtil.capitalize(primaryAttr.name)+"In(List<"+primaryAttr.type+"> ids)"
            for(let querySrv of this.editClass.queryServices){
                if (querySrv.name===findByIdInMethodName){
                    hasFindByIdIn = true
                    idx = count
                    break;
                }
                count++;
            }
            if(isAddFindByIdIn){
                if(hasFindByIdIn){
                    alert("FindByIdIn服务已存在!")
                    return;
                }
               let method={
                    name:findByIdInMethodName,
                    isCreateQueryModel: false,
                    isTypeQuery: false,
                    parameters:[]
                }
                this.editClass.queryServices.push(method); 
                this.currentQueryService = method;
                this.$eventHub.$emit ('serviceChanged',this.editClass);
                this.$refs.queryServicesTable.refresh(); 
            }

            if(!isAddFindByIdIn && hasFindByIdIn && idx>=0){
               this.deleteQueryService(idx);
               this.$eventHub.$emit ('serviceChanged',this.editClass);
               this.$refs.queryServicesTable.refresh(); 
            }
        
        },
        conditionChanged(item,event){
            item.condition = event.target.value;
            this.refreshQueryServiceName();
        },
        changeTypeQuery(item){
            if(item.isTypeQuery){
                item.name = item.name.replace(/findBy/g,"findByTypeAnd");
                item.name = item.name.replace(/\(/g,"(String type, ");
                if(item.parameters[0].name !== "type"){
                    let parameter={
                        name:"type",
                        type:"String",
                        isParameter:true,
                        condition:"",
                        relation:"And",
                        sort:"",
                        isNullable:false
                    }
                    item.parameters.splice(0,0,parameter);
                }
            }else{
                item.name = item.name.replace(/TypeAnd/g,"");
                item.name = item.name.replace(/String type, /g,"");
                if(item.parameters[0].name === "type"){
                    item.parameters.splice(0,1);
                }
            }
        },
        refreshQueryServiceName: function(item,event,isParameterChanged){
            if(this.currentQueryService.parameters.length>0){
                let methodNameString ="";
                let paramString="";
                let sortString="";
                let count =0;
                this.currentQueryService.name="";
                for(let parameter of this.currentQueryService.parameters){
                    let cName=parameter.name.replace(/\b\w/g, function(l){ return l.toUpperCase() });
                    if(parameter.isParameter){
                        methodNameString+=cName;
                        if(parameter.condition && parameter.condition!=""){
                            methodNameString+=parameter.condition;
                            if(parameter.condition !=="IsNotNull" && parameter.condition !=="IsNull"){
                                if(paramString && paramString!=""){
                                    paramString+=",";
                                }
                                paramString+=parameter.type+" "+ parameter.name;
                            }
                        }else{
                            if(paramString && paramString!=""){
                                paramString+=",";
                            }
                            paramString+=parameter.type+" "+ parameter.name;
                        }
                        if(count<this.currentQueryService.parameters.length-1){
                            if(parameter.relation && parameter.relation!=""){
                                methodNameString+=parameter.relation;
                            }else{
                                methodNameString+="Or";
                            }
                        }
                    }
                    if(parameter.sort && parameter.sort!=""){
                        sortString+=cName+parameter.sort;
                    }
                    count++;
                }
                if(methodNameString.endsWith("And")){
                    let idx = methodNameString.lastIndexOf("And");
                    methodNameString = methodNameString.substring(0,idx);
                }else if(methodNameString.endsWith("Or")){
                     let idx = methodNameString.lastIndexOf("Or");
                    methodNameString = methodNameString.substring(0,idx);
                }
                if(methodNameString!=""){
                    methodNameString="findBy"+methodNameString;
                }
                if(sortString!=""){
                    sortString="OrderBy"+sortString;
                }
                if(methodNameString!=""){
                    this.currentQueryService.name=methodNameString;
                }
                if(sortString!=""){
                    this.currentQueryService.name+=sortString;
                }
                if(paramString!=""){
                    this.currentQueryService.name+="("+paramString+")";
                }else{
                    this.currentQueryService.name+="()";
                }
                let aCount = 0
                for(let service of this.editClass.queryServices){
                    if(service.name.trim() === this.currentQueryService.name){
                        aCount ++;
                    }
                }
                if(aCount > 1){
                    alert("服务【"+this.currentQueryService.name+"】已经存在，请更改！");
                }
            }
            this.$eventHub.$emit ('serviceChanged',this.editClass);
        },
        deleteQueryService(index){
            this.editClass.queryServices.splice(index, 1);
            this.$refs.queryServicesTable.refresh();
            this.$eventHub.$emit ('serviceChanged',this.editClass);
            if(this.editClass.queryServices.length==0){
                this.currentQueryService = null;
            }else{
                let newIdx = index-1;
                this.currentQueryService = this.editClass.queryServices[newIdx];
            }
        },
        showQueryServiceDetail(queryService,index){
            this.currentQueryService = queryService;
        }  
    },
    mounted(){
        let _this = this;
        this.$eventHub.$on('classSelected',function(currentClass){
            _this.currentQueryService = null;
        });
        this.$eventHub.$on('restoreQueryServices',function(param){
            _this.restoreQueryServices(param);
        })
    },
    beforeDestroy(){
        this.$eventHub.$off('restoreQueryServices-name');
    },
    data(){
        return{
            currentQueryService: currentQueryService,
            queryServiceFields: [
                {
                    key: 'name',
                    label:'请编辑参数生成名称',
                    sortable: true
                },
                {
                    key: 'isCreateQueryModel',
                    label:'ModalPage',
                    sortable: false
                },
                {
                    key: 'isTypeQuery',
                    label:'子对象类型',
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
                    key: 'condition',
                    label:'条件',
                    sortable: true
                },
                {
                    key: 'relation',
                    label:'关系',
                    sortable: true
                },
                {
                    key: 'sort',
                    label:'排序',
                    sortable: true
                },
                {
                    key: 'isNullable',
                    label:'可空',
                    sortable: false
                }
            ],
            stringConditionOptions:[
                {text:"",value:""},
                {text:"Like",value:"Like"},
                {text:"NotLike",value:"NotLike"},
                {text:"StartingWith",value:"StartingWith"},
                {text:"EndingWith",value:"EndingWith"},
                {text:"Containing",value:"Containing"},
                {text:"IgnoreCase",value:"IgnoreCase"},
                {text:"IsNull",value:"IsNull"},
                {text:"IsNotNull",value:"IsNotNull"}
            ],
            integerConditionOptions:[
                {text:"",value:""},
                {text:"LessThan",value:"LessThan"},
                {text:"LessThanEqual",value:"LessThanEqual"},
                {text:"GreaterThan",value:"GreaterThan"},
                {text:"GreaterThanEqual",value:"GreaterThanEqual"},
                {text:"IsNull",value:"IsNull"},
                {text:"IsNotNull",value:"IsNotNull"}
            ],
            timestampConditionOptions:[
                {text:"",value:""},
                {text:"Before",value:"Before"},
                {text:"After",value:"After"}
            ],
            booleanConditionOptions:[
                {text:"",value:""},
                {text:"True",value:"True"},
                {text:"False",value:"False"},
                {text:"Not",value:"Not"}
            ],
            blankConditionOptions:[]
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
