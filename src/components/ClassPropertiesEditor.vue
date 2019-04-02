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
        <b-table striped  responsive :small=true :bordered=true hover :items="editClass.attributes" :fields="attributeFields"
        ref="attributesTable" @row-clicked = showAttributeDetail head-variant="light" thead-tr-class="sm">
            <template slot="actions" slot-scope="row">
                <button @click="deleteAttribute(row.index)">
                <font-awesome-icon icon="trash"/>
                </button>
            </template>
        </b-table>        
        <b-card no-body bg-variant="light" v-if="isShowAttributeProperties==true && currentAttribute!=null">
            <b-tabs card>
                <b-tab title="明细" active>
                    <b-form @submit.prevent >
                        <b-form-group
                            id="attributeNameGroup"
                            label="属性名称:"
                            label-for="attributeName"
                            label-size="sm"
                        >
                            <b-form-input
                            id="attributeName"
                            type="text"
                            size="sm"
                            v-model = "currentAttribute.name"
                            @change = "attrNameChanged"
                            required
                            placeholder="请输入属性名称" />
                        </b-form-group>
                        <b-form-group
                            id="attributeNameGroup"
                            label="属性描述:"
                            label-for="attributeDescription"
                            label-size="sm"
                        >
                            <b-form-input
                            id="attributeName"
                            type="text"
                            size="sm"
                            v-model = "currentAttribute.description"
                            placeholder="请输入属性描述" />
                        </b-form-group>
                        <b-form-group
                            id="attrTypeGroup"
                            label="数据类型:"
                            label-for="attrType"
                            label-size="sm"
                        >
                            <b-form-select 
                            id = "attrType"
                            v-model = "currentAttribute.type"
                            size="sm"
                            @change = "attrTypeChanged"
                            :options="attrTypes"/>
                        </b-form-group>
                        <b-form-checkbox
                            id="isPrimary"
                            name="isPrimary"
                            v-model = "currentAttribute.isPrimary"
                            @change = "isPrimaryChanged"
                            size="sm"
                        >
                        是否主键
                        </b-form-checkbox>
                        <b-form-checkbox
                            id="isCharSpec"
                            name="isCharSpec"
                            v-model = "currentAttribute.isCharSpec"
                            size="sm"
                            unchecked-value="false"
                        >
                        是否特征
                        </b-form-checkbox>
                    </b-form>
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
let isShowAttributeProperties=false;
export default {
    name:'ClassPropertiesEditor',
    props:['editClass'],
    methods:{
        showAttributeDetail(attribute,index){
            this.currentAttribute = attribute;
            this.isShowAttributeProperties = true;
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
        },
        importdAttributeFromPdm(){

        },
        importdAttributeFromDB(){

        },
        deleteAttribute(index){
            this.editClass.attributes.splice(index, 1);
            this.$refs.attributesTable.refresh();
            this.$eventHub.$emit ('AttributesChanged',this.editClass);
        },
        attrNameChanged(){
            this.$eventHub.$emit ('AttributesChanged',this.editClass);
        },
        attrTypeChanged(){
            this.$eventHub.$emit ('AttributesChanged',this.editClass);
        },
        isPrimaryChanged(){
            if(this.currentAttribute.isPrimary){
                this.currentAttribute.isPrimary = false;
            }else{
                this.currentAttribute.isPrimary = true;
            }
            this.$eventHub.$emit ('AttributesChanged',this.editClass);       
        }
    },
    data(){
        return{
            isShowAttributeProperties,
            currentAttribute,
            attributeFields: [
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
    },
    components: {
        AnnotationsEditor
    }
}
</script>         