<template>
    <div>
        <button @click="addAttribute"  title="新增属性">
            <font-awesome-icon icon="plus"/>
        </button>
        <button @click="importdAttributeFromPdm"  title="从PDM导入属性">
            <font-awesome-icon icon="file-powerpoint"/>
        </button>
        <button @click="importdAttributeFromDB" title="从数据库表导入属性">
            <font-awesome-icon icon="database" />
        </button>
        <b-table striped  responsive :small=true :bordered=true hover :items="editClass.attributes" :fields="attributeFields" class="my-table"
            ref="attributesTable" @row-clicked = "showAttributeDetail" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm"
            >
                    <!-- A virtual column -->
                <template slot="index" slot-scope="row">
                    {{ row.index + 1 }}
                </template>
                <template slot="actions" slot-scope="row">
                    <button @click="deleteAttribute(row.item)">
                    <font-awesome-icon icon="trash"/>
                    </button>
                </template>
                <template slot="isPrimary" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isPrimary"
                        size="sm"
                        unchecked-value="false"
                        @change="isPrimaryChanged(row.item)"
                    ></b-form-checkbox>
                </template>
                <template slot="isCharSpec" slot-scope="row">
                    <b-form-checkbox
                        v-model = "row.item.isCharSpec"
                        size="sm"
                        unchecked-value="false"
                        @change="isCharSpecChanged(row.item)"
                    ></b-form-checkbox>
                </template>
        </b-table>
        <br>
        <b-card no-body bg-variant="light" v-if="isShowAttributeProperties==true && currentAttribute!=null">
            <b-tabs card>
                <b-tab title="明细" active>
                    <form @submit.prevent >
                        <div class="form-group row">
                            <label for="attributeName" class="col-sm-4 col-form-label-sm">名称:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="attributeName" placeholder="请输入属性名称" 
                                :value = "currentAttribute.name" @change = "attrNameChanged(currentAttribute.name,$event)" required>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="description" class="col-sm-4 col-form-label-sm">描述:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="description" placeholder="请输入属性描述" 
                                v-model = "currentAttribute.description" required>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="attrType" class="col-sm-4 col-form-label-sm">数据类型:</label>
                            <div class="col-sm-8">
                                <b-select id="attrType" class="col-form-label-sm" :options="attrTypes" @change = "attrTypeChanged"
                                v-model = "currentAttribute.type"></b-select>
                            </div>
                        </div>
                    </form>
                </b-tab>
                <b-tab title="注解">
                    <AnnotationsEditor :mainClass = "currentAttribute"/>
                </b-tab>
                <b-tab title="枚举" >

                </b-tab>
                <b-tab title="校验" >
                    
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>
<script>
import AnnotationsEditor from '@/components/AnnotationsEditor';
let currentAttribute;
let currentAttributeIdx=-1;
let isShowAttributeProperties=false;
export default {
    name:'ClassPropertiesEditor',
    props:['editClass'],
    methods:{
        showAttributeDetail(attribute,index){
            this.currentAttribute = attribute;
            this.isShowAttributeProperties = true;
            this.currentAttributeIdx = index;
        },
        addAttribute(){
            var newRow = {
                name: "",
                type: "String",
                attrValidate:{
                    valueFrom: "",
                    valueTo: "",
                    interval: "",
                    formula: "",
                    isCustomized: false
                },
                description: "",
                isPrimary: false,
                isCharSpec: false,
                annotations:[],
                attrEnum:{}
            };
            this.editClass.attributes.push(newRow);
            this.$refs.attributesTable.refresh();
            let _this=this;
            setTimeout(function(){_this.clickAttributeTableRow(_this.editClass.attributes.length-1)},20);
        },
        importdAttributeFromPdm(){

        },
        importdAttributeFromDB(){

        },
        deleteAttribute(item){
            let preIdx=0;
            for( let i = 0; i < this.editClass.attributes.length; i++){ 
                if ( this.editClass.attributes[i] === item) {
                    this.editClass.attributes.splice(i, 1);
                    preIdx = i-1;
                }
            }
            if(preIdx<0){
                preIdx=0;
            }
            this.$refs.attributesTable.refresh();
            this.$eventHub.$emit ('AttributesChanged',this.editClass);
            this.clickAttributeTableRow(preIdx);
        },
        attrNameChanged(oldValue,event){
            let newValue = event.target.value;
            let _this= this;
            let hasError=false;
            _.each(this.editClass.attributes,function(attr,index){
                if(index!==_this.currentAttributeIdx && attr.name.trim()===newValue.trim()){
                    alert("同名属性已存在，请更换！")
                    hasError = true;
                    return false;
                }
            });
            if(!hasError){
                this.currentAttribute.name = newValue;
                this.$eventHub.$emit ('AttributesChanged',this.editClass);
            }else{
                event.target.value = oldValue;
            }
        },
        attrTypeChanged(){
            this.$eventHub.$emit ('AttributesChanged',this.editClass);
        },
        isPrimaryChanged(item){
            this.currentAttribute = item;
            if(item.isPrimary){
                item.isPrimary = false;
            }else{
                item.isPrimary = true;
            }
            let _this= this;
            _.each(this.editClass.attributes,function(attr){
                if(attr!==item && attr.isPrimary){
                    attr.isPrimary = false;
                }
            });
            this.$eventHub.$emit ('AttributesChanged',this.editClass);       
        },
        isCharSpecChanged(item){
            this.currentAttribute = item;
        },
        clickAttributeTableRow(index){
            let myTable = this.$refs.attributesTable.$el,
            tableBody = myTable.getElementsByTagName('tbody')[0],
            tableRows = tableBody.getElementsByTagName('tr')
            tableRows[index].click();
        }
    },
    data(){
        return{
            isShowAttributeProperties,
            currentAttribute,
            attributeFields: [
                {
                    key: 'index',
                    label:'序号',
                    sortable: false
                },
                {
                    key: 'name',
                    label:'名称',
                    sortable: true
                },
                {
                    key: 'type',
                    label:'类型',
                    sortable: false
                },
                {
                    key: 'isPrimary',
                    label:'主键',
                    sortable: false
                },
                {
                    key: 'isCharSpec',
                    label:'规格特征',
                    sortable: false
                },
                {
                    key: 'actions',
                    label:'操作',
                    sortable: false
                }
            ],
            attrTypes:[
                {value:'String',text:'String'},
                {value:'Long',text:'Long'},
                {value:'Integer',text:'Integer'},
                {value:'Timestamp',text:'Timestamp'},
                {value:'Boolean',text:'Boolean'},
            ]
        }
    },
    mounted() {
        let _this=this;
        //纯粹为了刷新一下组件
        let _currentAttruibute = this.currentAttribute;
        this.$eventHub.$on('classChanged', function(newClass){
            _this.currentAttribute = _currentAttruibute;
        });
        this.totalRows = this.editClass.attributes.length;
    },
    components: {
        AnnotationsEditor
    }
}
</script> 
<style>
.my-table {
  max-height: 200px;
  overflow-y: auto;
}
</style>
        