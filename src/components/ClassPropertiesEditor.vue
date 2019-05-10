<template>
    <div>
        <button @click="addAttribute"  title="新增属性">
            <font-awesome-icon icon="plus"/>
        </button>
        <button @click="showImportFromPdm"  title="从PDM导入属性">
            <font-awesome-icon icon="file-powerpoint"/>
        </button>
        <button @click="showImportFromDbTable" title="从数据库表导入属性">
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
                                <b-form-select id="attrType" class="col-form-label-sm" :options="attrTypes" @change = "attrTypeChanged"
                                v-model = "currentAttribute.type"></b-form-select>
                            </div>
                        </div>
                    </form>
                </b-tab>
                <b-tab title="注解">
                    <AnnotationsEditor :mainClass = "currentAttribute"/>
                </b-tab>
                <b-tab title="枚举" >
                    <EnumEditor :editAttribute = "currentAttribute"/>
                </b-tab>
                <b-tab title="校验" >
                    <AttrValidateEditor :editAttribute = "currentAttribute"/>
                </b-tab>
            </b-tabs>
        </b-card>
        <b-modal id="importPdmDialog"  ref = "importPdmDialog" title="从PDM导入属性" @ok="importPdm">
            <div class="form-group row">
                <label for="pdmName" class="col-sm-3 col-form-label-sm">PDM名称:</label>
                <div class="col-sm-9">
                    <input type="file" accept=".pdm" class="form-control col-form-label-sm" id="pdmName" placeholder="请选择PDM文件" 
                    ref="pdmName" @change="pdmFileChanged($event)">
                </div>
            </div>
            <div class="form-group row">
                <label for="tableName" class="col-sm-3 col-form-label-sm">表名:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="tableName" placeholder="请输入要导入的表名" 
                    ref="tableName" >
                </div>
            </div>
        </b-modal>
        <b-modal id="importDBDialog"  ref = "importDBDialog" title="从数据库表导入属性" @ok="importDbTable">
            <div class="form-group row">
                <label for="url" class="col-sm-3 col-form-label-sm">Url:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="url" placeholder="请输入连接数据库的Url" 
                    ref="url" >
                </div>
            </div>
            <div class="form-group row">
                <label for="user" class="col-sm-3 col-form-label-sm">用户名:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="user" placeholder="请输入连接数据库的用户名" 
                    ref="user" >
                </div>
            </div>
            <div class="form-group row">
                <label for="password" class="col-sm-3 col-form-label-sm">密码:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="password" placeholder="请输入连接数据库的密码" 
                    ref="password" >
                </div>
            </div>
            <div class="form-group row">
                <label for="tableName" class="col-sm-3 col-form-label-sm">表名:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="tableName" placeholder="请输入要导入的表名" 
                    ref="dbTableName" >
                </div>
            </div>
        </b-modal>
    </div>
</template>
<script>
import AnnotationsEditor from '@/components/AnnotationsEditor';
import EnumEditor from '@/components/EnumEditor';
import AttrValidateEditor from '@/components/AttrValidateEditor';
import axios from "axios";
let currentAttribute;
let currentAttributeIdx=-1;
let isShowAttributeProperties=false;
let pdmFile=null;
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
                attrEnum:null
            };
            this.editClass.attributes.push(newRow);
            this.$refs.attributesTable.refresh();
            let _this=this;
            setTimeout(function(){_this.clickAttributeTableRow(_this.editClass.attributes.length-1)},20);
        },
        deleteAttribute(item){
            let preIdx=0;
            for( let i = 0; i < this.editClass.attributes.length; i++){ 
                if ( this.editClass.attributes[i] === item) {
                    this.editClass.attributes.splice(i, 1);
                    preIdx = i-1;
                    break;
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
            if(item.isCharSpec){
                item.isCharSpec = false;
            }else{
                item.isCharSpec = true;
            }
        },
        clickAttributeTableRow(index){
            let myTable = this.$refs.attributesTable.$el,
            tableBody = myTable.getElementsByTagName('tbody')[0],
            tableRows = tableBody.getElementsByTagName('tr')
            tableRows[index].click();
        },
        showImportFromPdm(){
            this.$refs.importPdmDialog.show();
        },
        showImportFromDbTable(){
            this.$refs.importDBDialog.show();
        },
        pdmFileChanged(event){
            this.pdmFile = event.target.files[0];
        },
        importPdm(bvModalEvt){
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            let tableName = this.$refs.tableName.value;
            if(null==this.pdmFile){
                alert("请选择PDM文件！");
                return;
            }
            let reader = new FileReader();
            let _this = this;
            reader.addEventListener("load", function () {
                let  pdmContent = reader.result;
                let aUrl = '/component/importPdmTable/' + tableName;
                if(pdmContent!=null){
                    axios({
                        method: 'post',
                        baseURL: 'http://localhost:8083',
                        url: aUrl,
                        data: pdmContent,
                        headers: {'Content-Type': 'text/xml'},
                        responseEncoding: 'utf8', 
                        responseType: 'json'
                    }).then(
                        function (returnValue) {
                            if (returnValue) {
                                let attrs= returnValue.data;
                                _.each(attrs,function(attr){
                                    let newRow = {
                                        name: attr.name,
                                        type: attr.type,
                                        attrValidate:{
                                            valueFrom: "",
                                            valueTo: "",
                                            interval: "",
                                            formula: "",
                                            isCustomized: false
                                        },
                                        description: attr.description,
                                        isPrimary: false,
                                        isCharSpec: false,
                                        annotations:[],
                                        attrEnum:null
                                    };
                                    _this.editClass.attributes.push(newRow);
                                })
                            }
                            _this.$refs.importPdmDialog.hide();
                            _this.$refs.attributesTable.refresh();
                            _this.$eventHub.$emit ('AttributesChanged',_this.editClass);
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
                            alert(error.message);
                        }
                    );
                }
            }, false);
            reader.readAsText(this.pdmFile);
        },
        importDbTable(bvModalEvt){
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            let url = this.$refs.url.value;
            let user = this.$refs.user.value;
            let password = this.$refs.password.value;
            let tableName = this.$refs.dbTableName.value;
            if(null==url){
                alert("请输入Url！");
                return;
            }
            if(null==user){
                alert("请输入user！");
                return;
            }
            if(null==password){
                alert("请输入password！");
                return;
            }
            if(null==tableName){
                alert("请输入tableName！");
                return;
            }
            let data = {url:url,user:user,password:password,tableName:tableName};
            let dataString = JSON.stringify(data);
            let aUrl = '/component/importDBTable';
            let _this=this;
            axios({
                method: 'post',
                baseURL: 'http://localhost:8083',
                url: aUrl,
                data: dataString,
                headers: {'Content-Type': 'application/json'},
                responseEncoding: 'utf8', 
                responseType: 'json'
            }).then(
                function (returnValue) {
                    if (returnValue) {
                        let attrs= returnValue.data;
                        _.each(attrs,function(attr){
                            let newRow = {
                                name: attr.name,
                                type: attr.type,
                                attrValidate:{
                                    valueFrom: "",
                                    valueTo: "",
                                    interval: "",
                                    formula: "",
                                    isCustomized: false
                                },
                                description: attr.description,
                                isPrimary: false,
                                isCharSpec: false,
                                annotations:[],
                                attrEnum:null
                            };
                            _this.editClass.attributes.push(newRow);
                        })
                    }
                    _this.$refs.importDBDialog.hide();
                    _this.$refs.attributesTable.refresh();
                    _this.$eventHub.$emit ('AttributesChanged',_this.editClass);
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
                    alert(error.message);
                }
            );
        }
    },
    data(){
        return{
            isShowAttributeProperties,
            currentAttribute,
            pdmFile,
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
        this.$eventHub.$on('ClassNameChanged',function(currentClass){
            if(_this.$refs.attributesTable){
                _this.$refs.attributesTable.refresh();
            }
        });
        this.$eventHub.$on('restoreEntitiesServices',function(param){
            _this.restoreEntitiesServices(param);
        });
    },
    components: {
        AnnotationsEditor,
        EnumEditor,
        AttrValidateEditor
    }
}
</script> 
<style>
.my-table {
  max-height: 200px;
  overflow-y: auto;
}
</style>
        