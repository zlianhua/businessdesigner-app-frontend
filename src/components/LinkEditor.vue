<template>
    <div v-if="linkObj!=null">
        <b-card no-body bg-variant="light">
            <b-tabs card>
                <b-tab title="关系信息" active>
                    <b-form @submit.prevent>
                        <div class="form-group row">
                            <label for="sourceRelationName" class="col-sm-4 col-form-label-sm">起点关系名称:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="sourceRelationName" placeholder="请输入起点关系名称" 
                                v-model = "linkObj.sourceRelationName">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="targetRelationName" class="col-sm-4 col-form-label-sm">终点关系名称:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="targetRelationName" placeholder="请输入终点关系名称" 
                                v-model = "linkObj.targetRelationName">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="sourceRoleLabel" class="col-sm-4 col-form-label-sm">起点({{linkObj.sourceName}}):</label>
                            <div class="col-sm-8">
                                <b-form-select 
                                id = "sourceRoleLabel"
                                v-model = "linkObj.sourceRoleLabel"
                                size="sm"
                                @change="roleLabelChanged"
                                :options="roleOptions"/>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="targetRoleLabel" class="col-sm-4 col-form-label-sm">终点({{linkObj.targetName}}):</label>
                            <div class="col-sm-8">
                                <b-form-select 
                                id = "targetRoleLabel"
                                v-model = "linkObj.targetRoleLabel"
                                size="sm"
                                @change="roleLabelChanged"
                                :options="roleOptions"/>
                            </div>
                        </div>
                    </b-form>
                </b-tab>
            </b-tabs>        
        </b-card>                    
    </div>
</template>
<script>
export default {
    name:'LinkEditor',
    props:['linkObj'],
    data(){
        return{
            roleOptions:[
                "1..1",
                "1..*",
                "0..1",
                "0..*",
                "*..*"
            ]
        }
    },
    methods:{
        roleLabelChanged(){
            this.$eventHub.$emit ('roleLabelChanged',this.linkObj);
        }
    }
}
</script>
