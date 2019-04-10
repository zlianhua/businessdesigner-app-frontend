<template>
    <div v-if="linkObj!=null">
        <b-card no-body bg-variant="light">
            <b-tabs card>
                <b-tab title="关系信息" active>
                    <b-form @submit.prevent>
                        <b-form-group
                            id="sourceRelationNameGroup"
                            label="起点关系名称:"
                            label-for="sourceRelationName"
                            label-size="sm"
                        >
                            <b-form-input
                            id="sourceRelationName"
                            type="text"
                            size="sm"
                            v-model = "linkObj.sourceRelationName"
                            placeholder="请起点关系名称" />
                        </b-form-group>
                        <b-form-group
                            id="targetRelationNameGroup"
                            label="终点关系名称:"
                            label-for="targetRelationName"
                            label-size="sm"
                        >
                            <b-form-input
                            id="targetRelationName"
                            type="text"
                            size="sm"
                            v-model = "linkObj.targetRelationName"
                            placeholder="请终点关系名称" />
                        </b-form-group>
                        <b-form-group>
                            <p size="sm">起点({{linkObj.sourceName}}):</p>
                            <b-form-select 
                            id = "sourceRoleLabel"
                            v-model = "linkObj.sourceRoleLabel"
                            size="sm"
                            @change="roleLabelChanged"
                            :options="roleOptions"/>
                        </b-form-group>
                        <b-form-group>
                            <p size="sm">终点({{linkObj.targetName}}):</p>
                            <b-form-select 
                            id = "targetRoleLabel"
                            v-model = "linkObj.targetRoleLabel"
                            size="sm"
                            @change="roleLabelChanged"
                            :options="roleOptions"/>
                        </b-form-group>
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
