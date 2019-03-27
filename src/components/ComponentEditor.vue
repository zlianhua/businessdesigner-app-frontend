<template>
    <div>
        <div  v-if="isShowComponentProperties==true">
            <ComponentPropertyEditor :component="$parent.component"/>
        </div>
        <div v-if="isShowClassProperties==true && editClass!=null ">
            <ClassEditor :editClass="editClass"/>
        </div> 
        <div v-if="isShowLinkProperties==true">
            
        </div>   
    </div>
</template>
<script>
let isShowComponentProperties= false;
let isShowClassProperties = false;
let isShowLinkProperties= false;
let editClass = null;
import ComponentPropertyEditor from '@/components/ComponentPropertyEditor';
import ClassEditor from '@/components/ClassEditor';
export default {
  name: 'ComponentEditor',
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
    showLinkProperties(){
        this.isShowComponentProperties = false;
        this.isShowClassProperties =false;
        this.isShowLinkProperties = true;
    }
  },
  mounted(){
    var _this=this;
    this.$eventHub.$on('showComponentProperties', this.showComponentProperties);
    this.$eventHub.$on('classSelected',function(currentClass){
        _this.showClassProperties(currentClass);
    });
    this.$eventHub.$on('showLinkProperties',this.showLinkProperties);
  },
  components: {
    ComponentPropertyEditor,
    ClassEditor
  }
}
</script>    