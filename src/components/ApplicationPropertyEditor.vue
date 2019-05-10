<template>
    <b-card no-body bg-variant="light" class="col-form-label-sm">
        <b-tabs card>
            <b-tab title="基本信息" active>
                <b-form @submit.prevent>
                    <div class="form-group row">
                        <label for="name" class="col-sm-3 col-form-label-sm">名称:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="name" placeholder="请输入名称" 
                            v-model = "application.name" >
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="groupId" class="col-sm-3 col-form-label-sm">groupId:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="groupId" placeholder="请输入groupId" 
                            v-model = "application.groupId" required >
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="artifactId" class="col-sm-3 col-form-label-sm">artifactId:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="artifactId" placeholder="请输入artifactId" 
                            v-model = "application.artifactId" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="version" class="col-sm-3 col-form-label-sm">版本:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="version" placeholder="请输入版本" 
                            v-model = "application.version" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="url" class="col-sm-3 col-form-label-sm">url:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="url" placeholder="请输入url" 
                            v-model = "application.url" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="port" class="col-sm-3 col-form-label-sm">port:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="port" placeholder="请输入port" 
                            v-model = "application.port" required>
                        </div>
                    </div>
                </b-form>
            </b-tab>
            <b-tab title="引用构件">
                 <button @click="addComponent"  title="新增构件引用">
                    <font-awesome-icon icon="plus"/>
                </button>
                <b-table striped  responsive :small=true :bordered=true :items="application.componentRefs" :fields="componentRefFields" class="my-table"
                ref="componentRefTable" head-variant="light" tbody-tr-class="col-form-label-sm" thead-class="col-form-label-sm">
                    <template slot="name" slot-scope="row">
                        <span tabindex="0" data-toggle="tooltip" :title="row.item.name">
                            <input type="text" class="form-control col-form-label-sm" :value = "row.item.name" @change="nameChanged(row.item,$event)">
                        </span>
                    </template>
                    <template slot="version" slot-scope="row">
                        <span tabindex="0" data-toggle="tooltip" :title="row.item.version">
                            <input type="text" class="form-control col-form-label-sm" :value = "row.item.version" @change="versionChanged(row.item,$event)">
                        </span>
                    </template>
                    <template slot="actions" slot-scope="row">
                        <button @click="deleteComponentRef(row.index)">
                        <font-awesome-icon icon="trash"/>
                        </button>
                    </template>
                </b-table>
            </b-tab>
            <b-tab title="数据库信息" >
                <b-form @submit.prevent>
                    <div class="form-group row">
                        <label for="dbType" class="col-sm-3 col-form-label-sm">数据库类型:</label>
                        <div class="col-sm-9">
                            <b-form-select id="dbType" :options="dbTypeOptions" :select-size="2" 
                            v-model = "application.dbType" class="form-control col-form-label-sm"></b-form-select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="dbUrl" class="col-sm-3 col-form-label-sm">Url:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="dbUrl" placeholder="请输入Url" 
                            v-model = "application.dbUrl" required >
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="dbUserName" class="col-sm-3 col-form-label-sm">用户名:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="dbUserName" placeholder="请输入用户名" 
                            v-model = "application.dbUserName" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="dbPassword" class="col-sm-3 col-form-label-sm">密码:</label>
                        <div class="col-sm-9">
                            <input type="password" class="form-control col-form-label-sm" id="dbPassword" placeholder="请输入密码" 
                            v-model = "application.dbPassword" required>
                        </div>
                    </div>
                </b-form>
            </b-tab>
            <b-tab title="Kafka消息队列">
                <b-form @submit.prevent>
                    <div class="form-group row">
                        <label for="kafkaServers" class="col-sm-3 col-form-label-sm">主机:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="kafkaServers" placeholder="请输入主机" 
                            v-model = "application.kafkaServers" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="kafkaKeySerializer" class="col-sm-3 col-form-label-sm">键序列化:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="kafkaKeySerializer" placeholder="请输入键序列化" 
                            v-model = "application.kafkaKeySerializer" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="kafkaValueSerializer" class="col-sm-3 col-form-label-sm">值序列化:</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control col-form-label-sm" id="kafkaValueSerializer" placeholder="请输入值序列化" 
                            v-model = "application.kafkaValueSerializer" required>
                        </div>
                    </div>
                </b-form>
            </b-tab>
        </b-tabs>
    </b-card>   
</template>
<script>
export default {
    name: 'ApplicationPropertyEditor',
    props:['application'],
    data() {
      return {
        dbTypeOptions: [
          { value: 'MySql', text: 'MySql' },
          { value: 'Oracle', text: 'Oracle' },
        ],
        componentRefFields: [
            {
                key: 'name',
                label:'名称',
                sortable: true
            },
            {
                key: 'version',
                label:'版本',
                sortable: false
            },
            {
                key: 'actions',
                label:'操作',
                sortable: false
            }
        ],
      }
    },
    methods:{
        addComponent(){
            var component={
                name: "",
                version: "0.1-snapshot"
            }
            if(!this.application.componentRefs){
                this.application.componentRefs=[];
            }
            this.application.componentRefs.push(component);
            this.$refs.componentRefTable.refresh();
        },
        deleteComponentRef(index){
            this.application.componentRefs.splice(index,1);
            this.$refs.componentRefTable.refresh();
        },
        nameChanged(item,event){
            item.name = event.target.value;
        },
        versionChanged(item,event){
            item.version = event.target.value;
        }
    }
}
</script>
<style>

</style>
