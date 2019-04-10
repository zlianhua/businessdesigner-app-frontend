<template>
    <div>
        <div  v-if="isShowComponentProperties==true">
            <ComponentPropertyEditor :component="$parent.component"/>
        </div>
        <div v-if="isShowClassProperties==true && editClass!=null ">
            <ClassEditor :editClass = "editClass" :entityMap="entityMap" :linkMap="linkMap"/>
        </div> 
        <div v-if="isShowLinkProperties==true && editLinkObj!=null">
            <LinkEditor :linkObj = "editLinkObj"/>
        </div>   
    </div>
</template>
<script>
let isShowComponentProperties= false;
let isShowClassProperties = false;
let isShowLinkProperties= false;
let editClass = null;
let editLinkObj=null;
import ComponentPropertyEditor from '@/components/ComponentPropertyEditor';
import ClassEditor from '@/components/ClassEditor';
import LinkEditor from '@/components/LinkEditor';
export default {
  name: 'ComponentEditor',
  props:['entityMap','linkMap'],
  data: function(){
      return {
        isShowComponentProperties,
        isShowClassProperties,
        isShowLinkProperties
    }
  },
  methods:{
    showComponentProperties(){
        this.isShowComponentProperties = true;
        this.isShowClassProperties =false;
        this.isShowLinkProperties = false;
    },
    showClassProperties(currentClass){
        this.isShowComponentProperties = false;
        this.isShowClassProperties =false;
        this.isShowClassProperties =true;
        this.isShowLinkProperties = false;
        this.editClass = currentClass;
        this.$eventHub.$emit('classChanged',currentClass);
    },
    showLinkProperties(currentLinkObj){
        this.isShowComponentProperties = false;
        this.isShowClassProperties =false;
        this.isShowLinkProperties = false;
        this.isShowLinkProperties = true;
        this.editLinkObj = currentLinkObj;
    }
  },
  mounted(){
    var _this=this;
    this.$eventHub.$on('showComponentProperties', this.showComponentProperties);
    this.$eventHub.$on('classSelected',function(currentClass){
        _this.showClassProperties(currentClass);
    });
    this.$eventHub.$on('showLinkProperties',function(currentLinkObj){
        _this.showLinkProperties(currentLinkObj);
    });
  },
  components: {
    ComponentPropertyEditor,
    ClassEditor,
    LinkEditor
  }
}
</script>    