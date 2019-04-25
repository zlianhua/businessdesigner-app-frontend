<template>
    <b-card no-body bg-variant="light" class="col-form-label-sm">
        <b-tabs card>
            <b-tab title="构件信息" active>
                <b-form @submit.prevent>
                    <div class="form-group row">
                        <label for="simpleName" class="col-sm-3 col-form-label-sm">构件名称:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="simpleName" placeholder="请输入构件名称" 
                            v-model = "component.simpleName" required @change="simpleNameChanged">
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="basePackageName" class="col-sm-3 col-form-label-sm">构件路径:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="basePackageName" placeholder="请输入构件名称" 
                            v-model = "component.basePackageName" required @change="basePackageNameChanged">
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="description" class="col-sm-3 col-form-label-sm">描述:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="description" placeholder="请输入描述" 
                            v-model = "component.description" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="version" class="col-sm-3 col-form-label-sm">版本:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="version" placeholder="请输入版本" 
                            v-model = "component.version" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="author" class="col-sm-3 col-form-label-sm">作者:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="author" placeholder="请输入作者" 
                            v-model = "component.author" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="isExtendsAbstractEntity" class="col-sm-4 col-form-label-sm">继承基础对象:</label>
                        <div class="col-sm-8">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isExtendsAbstractEntity" v-model = "component.isExtendsAbstractEntity">
                            </div>
                        </div>
                    </div>
                </b-form>
            </b-tab>
            <b-tab title="构件持久化配置">
                <b-form @submit.prevent>
                    <div class="form-group row">
                        <label for="inheritanceStrategy" class="col-sm-3 col-form-label-sm">继承策略:</label>
                        <div class="col-sm-9">
                            <b-form-select id="inheritanceStrategy" :options="options" :select-size="3" 
                            v-model = "component.inheritanceStrategy" class="form-control col-form-label-sm"></b-form-select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="tablePrefix" class="col-sm-3 col-form-label-sm">表名前缀:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="tablePrefix" placeholder="请输入表名前缀" 
                            v-model = "component.tablePrefix" required>
                        </div>
                    </div>
                </b-form>
            </b-tab>
        </b-tabs>
    </b-card>   
</template>
<script>
export default {
    name: 'ComponentPropertyEditor',
    props:['component'],
    data() {
      return {
        options: [
          { value: 'SINGLE_TABLE', text: '父子表持久化到一张父表' },
          { value: 'TABLE_PER_CLASS', text: '父表随子表持久化到多张子表' },
          { value: 'SECONDARY_TABLE', text: '父子表均持久化' }
        ]
      }
    },
    methods:{
        simpleNameChanged(){
            this.$eventHub.$emit ('componentNameChanged');
        },
        basePackageNameChanged(event){
            this.$eventHub.$emit ('componentNameChanged');
        }
    }
}
</script>
