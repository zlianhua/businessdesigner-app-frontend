<template>
    <div>
        <button @click="addAnnotation" title="新增注解">
            <font-awesome-icon icon="plus"/>
        </button>
        <b-table responsive :small=true :bordered=true hover :items="mainClass.annotations" :fields="annotaionFields" 
        ref="annotaionsTable" class="my-table">
            <template slot="annotation" slot-scope="data">
                <b-form-input id ="data.key" size="sm" v-model="data.value" type="text" required placeholder="请输入注解" @change="setAnnotation(data)"/>
            </template> 
            <template slot="actions" slot-scope="row">
                <button @click="deleteAnnotation(row.index)">
                    <font-awesome-icon icon="trash"/>
                </button>
            </template>
        </b-table>
    </div>
</template>
<script>
export default {
    name:'AnnotationsEditor',
    props:['mainClass'],
    methods:{
        addAnnotation(){
            var newRow = {
                annotation: ""
            };
            this.mainClass.annotations.push(newRow);
            this.$refs.annotaionsTable.refresh();
        },
        deleteAnnotation(index){
            this.mainClass.annotations.splice(index, 1);
            this.$refs.annotaionsTable.refresh();
        },
        setAnnotation(data){
            this.mainClass.annotations[data.index]=data.value;
        }
    },
    data(){
        return{
            annotaionFields: [
                {
                    key: 'annotation',
                    label:'注解',
                    sortable: true
                },
                {
                    key: 'actions',
                    label:'动作',
                    sortable: false
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

