<template>
    <b-card no-body bg-variant="light">
        <b-tabs card>
            <b-tab title="构件信息" active>
                <b-form @submit.prevent>
                    <b-form-group
                        id="componentNameGroup"
                        label="构件名称:"
                        label-for="simpleName"
                        label-size="sm"
                    >
                        <b-form-input
                        id="simpleName"
                        type="text"
                        size="sm"
                        v-model="component.simpleName"
                        required
                        placeholder="请输入构件名称" />
                    </b-form-group>
                    <b-form-group   
                            id="basePackageNameGroup"
                            label="构件路径:"
                            label-for="basePackageName"
                            label-size="sm"
                    >
                        <b-form-input
                            id="basePackageName"
                            type="text"
                            size="sm"
                            v-model="component.basePackageName"
                            required
                            placeholder="请输入构件路径" />
                    </b-form-group>
                    <b-form-group   
                            id="descriptionGroup"
                            label="描述:"
                            label-for="description"
                            label-size="sm"
                    >
                        <b-form-input
                            id="description"
                            type="text"
                            size="sm"
                            v-model="component.description"
                            required
                            placeholder="请输入构件描述" />
                    </b-form-group>
                    <b-form-group   
                            id="versionGroup"
                            label="版本:"
                            label-for="version"
                            label-size="sm"
                    >
                        <b-form-input
                            id="version"
                            type="text"
                            size="sm"
                            v-model="component.version"
                            required
                            placeholder="请输入构件版本" />
                    </b-form-group>
                    <b-form-group   
                            id="authorGroup"
                            label="作者:"
                            label-for="author"
                            label-size="sm"
                    >
                        <b-form-input
                            id="author"
                            type="text"
                            size="sm"
                            v-model="component.author"
                            required
                            placeholder="请输入构件作者" />
                    </b-form-group>
                    <b-form-checkbox
                        id="isExtendsAbstractEntity"
                        name="isExtendsAbstractEntity"
                        v-model="component.isExtendsAbstractEntity"
                        value="true"
                        size="sm"
                        unchecked-value="false"
                    >
                    是否继承基础对象
                    </b-form-checkbox>
                </b-form>
            </b-tab>
            <b-tab title="构件持久化配置">
                <b-form @submit.prevent>
                    <label label-for="inheritanceStrategy"
                            label-size="sm"
                    >请选择继承策略</label>
                    <b-form-select 
                    id = "inheritanceStrategy"
                    v-model="component.inheritanceStrategy"
                    :select-size="3" 
                    value="options[0]"
                    size="sm"
                    :options="options"/>
                    <b-form-group   
                            id="tablePrefixGroup"
                            label="表名前缀:"
                            label-for="tablePrefix"
                            label-size="sm"
                    >
                        <b-form-input
                            id="author"
                            type="text"
                            size="sm"
                            v-model="component.tablePrefix"
                            required
                            placeholder="请输入表名前缀" />
                    </b-form-group>
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
    }
}
</script>
