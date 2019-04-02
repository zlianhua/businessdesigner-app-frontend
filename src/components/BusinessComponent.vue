<template>
    <b-container id="objectDiagram">
        <b-row>
            <!--draw area-->
            <b-col cols=8>
                <ComponentCanvas :entityMap="entityMap"/>
            </b-col>
            <b-col cols=4>
                <ComponentEditor/>
            </b-col>
        </b-row>
        <b-button @click="logComponent">logComponent</b-button>
        <b-button @click="logEntityMap">logEntityMap</b-button>
  </b-container>
</template>
<script>
import ComponentCanvas from '@/components/ComponentCanvas';
import ComponentEditor from '@/components/ComponentEditor';
import Vue from 'vue';
let entityMap = new Map();
let linkMap = new Map();
let component = {
    simpleName: "",
    basePackageName: "com.ai.bss",
    name: "",
    description: "",
    version: "0.1-snapshot",
    inheritanceStrategy: "TABLE_PER_CLASS",
    tablePrefix: "",
    extendsAbstractEntity: "false",
    entities: [],
    associations: [],
    oomXml: ""
};
var eventBus= new Vue ();
export default {
    name: 'BusinessComponent',
    methods: {
        logComponent(){
            console.log(this.component);
        },
        logEntityMap(){
            console.log(this.entityMap);
        },
        deleteCell(){
            
        }
    },
    data(){
        return {
            component: component,
            entityMap: entityMap,
            linkMap: linkMap,
            eventBus: eventBus
        }
    },
    components: {
        ComponentCanvas,
        ComponentEditor
    }
}
</script>

