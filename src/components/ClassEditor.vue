<template>
    <div>
        <b-card no-body bg-variant="light" class="col-form-label-sm">
            <b-tabs card>
                <b-tab title="基本信息" active>
                    <form @submit.prevent>
                        <div class="form-group row">
                            <label for="entityName" class="col-sm-3 col-form-label-sm">名称:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="entityName" placeholder="请输入对象名称" 
                                v-model = "editClass.entityName" @change = "emitNameChanged" required>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="description" class="col-sm-3 col-form-label-sm">描述:</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control col-form-label-sm" id="description" placeholder="请输入对象描述" 
                                v-model = "editClass.description" required>
                            </div>
                        </div>
                       <div class="form-group row">
                            <div class="col-sm-3 col-form-label-sm">是否根对象:</div>
                            <div class="col-sm-8">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="isRootEntity" v-model = "editClass.isRootEntity">
                                </div>
                            </div>
                        </div>
                    </form>
                </b-tab>
                <b-tab title="属性">
                    <ClassPropertiesEditor :editClass = "editClass"/>
                </b-tab>
                <b-tab title="注解">
                    <AnnotationsEditor :mainClass = "editClass"/>
                </b-tab>
                <b-tab title="命令服务">
                    <CommandServicesEditor :editClass = "editClass" :entityMap="entityMap" :linkMap="linkMap"/>
                </b-tab>
                <b-tab title="查询服务">
                    <!-- <AnnotationsEditor :mainClass = "editClass"/> -->
                </b-tab>
            </b-tabs>        
        </b-card>
    </div>    
</template>
<script>
import ClassPropertiesEditor from '@/components/ClassPropertiesEditor';
import AnnotationsEditor from '@/components/AnnotationsEditor';
import CommandServicesEditor from '@/components/CommandServicesEditor';
import { constants } from 'fs';
export default {
    name:'ClassEditor',
    props:['editClass','entityMap','linkMap'],
    methods: {
        emitNameChanged(){
            this.$eventHub.$emit ('ClassNameChanged',this.editClass);
        }
    },
    components: {
        ClassPropertiesEditor,
        AnnotationsEditor,
        CommandServicesEditor
    }
}
</script>
