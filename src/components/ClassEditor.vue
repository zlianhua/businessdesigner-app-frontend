<template>
    <div>
        <b-card no-body bg-variant="light">
            <b-tabs card>
                <b-tab title="对象基本信息" active>
                    <b-form @submit.prevent>
                        <b-form-group
                            id="entityNameGroup"
                            label="对象名称:"
                            label-for="entityName"
                            label-size="sm"
                        >
                            <b-form-input
                            id="entityName"
                            type="text"
                            size="sm"
                            v-model = "editClass.entityName"
                            @change = "emitNameChanged"
                            required
                            placeholder="请输入对象名称" />
                        </b-form-group>
                    </b-form>
                </b-tab>
                <b-tab title="对象属性">
                    <ClassPropertiesEditor :editClass = "editClass"/>
                </b-tab>
                <b-tab title="注解">
                    <AnnotationsEditor :mainClass = "editClass"/>
                </b-tab>
            </b-tabs>        
        </b-card>
    </div>    
</template>
<script>
import ClassPropertiesEditor from '@/components/ClassPropertiesEditor';
import AnnotationsEditor from '@/components/AnnotationsEditor';
import { constants } from 'fs';
export default {
    name:'ClassEditor',
    props:['editClass'],
    methods: {
        emitNameChanged(){
            this.$eventHub.$emit ('ClassNameChanged',this.editClass);
        }
    },
    components: {
        ClassPropertiesEditor,
        AnnotationsEditor
    }
}
</script>
