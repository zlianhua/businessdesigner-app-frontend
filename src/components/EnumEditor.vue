<template>
    <div>
        <div class="form-group row">
            <label for="hasAttrEnum" class="col-sm-3 col-form-label-sm">有无枚举:</label>
            <div class="col-sm-1">
                <input class="form-check-input" type="checkbox" id="hasAttrEnum" @change="hasAttrEnumChanged($event)" v-model="hasAttrEnum">
            </div>
            <label for="enumName" class="col-sm-3 col-form-label-sm" v-if="hasAttrEnum">枚举名称:</label>
            <div class="col-sm-5" v-if="hasAttrEnum">
                <input type="text" class="form-control col-form-label-sm" id="name" placeholder="请输入枚举名称"
                v-model="editAttribute.attrEnum.name" >
            </div>
        </div>
        <div v-if="hasAttrEnum" >
            <div class="form-group row">
                <label for="hasCode" class="col-sm-3 col-form-label-sm">定义代码:</label>
                <div class="col-sm-1">
                    <input class="form-check-input col-form-label-sm" type="checkbox"  id="hasCode"  v-model="editAttribute.attrEnum.hasCode">
                </div>
                <label for="dataType" class="col-sm-3 col-form-label-sm" v-if="editAttribute.attrEnum.hasCode">代码类型:</label>
                <div class="col-sm-5" v-if="editAttribute.attrEnum.hasCode">
                    <select id="dataType" v-model="editAttribute.attrEnum.dataType" class="form-control col-form-label-sm">
                        <option>String</option>
                        <option>int</option>
                    </select>
                </div>
            </div>
            <button @click="addEnum"  title="新增枚举">
                <font-awesome-icon icon="plus"/>
            </button>
            <b-table striped  responsive :small=true :bordered=true hover :items="editAttribute.attrEnum.enums" :fields="enumFields" class="my-table"
              ref="enumTable" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm"
            >
                <template slot="actions" slot-scope="row">
                    <button @click="deleteEnum(row.item)">
                    <font-awesome-icon icon="trash"/>
                    </button>
                </template>
                <template slot="name" slot-scope="row">
                    <input type="text" class="form-control col-form-label-sm" :value = "row.item.name" @change="enumNameChanged(row.item,$event)">
                </template>
                <template slot="code" slot-scope="row">
                    <input type="text" class="form-control col-form-label-sm" v-if="editAttribute.attrEnum.hasCode" :value = "row.item.code" @change="enumCodeChanged(row.item,$event)">
                </template>
            </b-table>
        </div>
    </div>
</template>
<script>
let hasAttrEnum = false;
export default {
    name:'EnumEditor',
    props:['editAttribute'],
    methods:{
        hasAttrEnumChanged(event){
            if(event.target.checked){
                this.editAttribute.attrEnum={}
                this.editAttribute.attrEnum.enums = [];
            }else{
                this.editAttribute.attrEnum=null;
            }
        },
        addEnum(){
            let newEnumRow = {
                name: "",
                code: ""
            };
            this.editAttribute.attrEnum.enums.push(newEnumRow);
            this.$refs.enumTable.refresh();
        },
        deleteEnum(item){
            for( let i = 0; i < this.editAttribute.attrEnum.enums.length; i++){ 
                if ( this.editAttribute.attrEnum.enums[i] == item) {
                    this.editAttribute.attrEnum.enums.splice(i, 1);
                    this.$refs.enumTable.refresh();
                    break;
                }
            }
        },
        enumNameChanged(item,event){
            item.name = event.target.value;
        },
        enumCodeChanged(item,event){
            item.code = event.target.value;
        }
    },
    data(){
        return {
            hasAttrEnum,
            enumFields: [
                {
                    key: 'name',
                    label:'名称',
                    sortable: true
                },
                {
                    key: 'code',
                    label:'代码',
                    sortable: false
                },
                {
                    key: 'actions',
                    label:'操作',
                    sortable: false
                }
            ]
        }
    },
    mounted(){
        if(this.editAttribute.attrEnum){
            this.hasAttrEnum = true;
        }else{
            this.hasAttrEnum = false;
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
