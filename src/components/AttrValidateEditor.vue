<template>
    <div>
        <div class="form-group row">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="hasAttrValidate" v-model="hasAttrValidate" @change="hasAttrValidateChanged($event)">
              <label class="form-check-label" for="hasAttrValidate">配置校验信息</label>
            </div>
        </div>
        <div v-if="hasAttrValidate">
            <div class="form-group row">
                <label for="interval" class="col-sm-3 col-form-label-sm">间隔:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="interval" placeholder="请输入间隔" 
                    v-model = "editAttribute.attrValidate.interval" >
                </div>
            </div>
            <div class="form-group row">
                <label for="formula" class="col-sm-3 col-form-label-sm">公式:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="formula" placeholder="请输入公式" 
                    v-model = "editAttribute.attrValidate.formula" >
                </div>
            </div>
            <div class="form-group row">
                <label for="minLength" class="col-sm-3 col-form-label-sm">最小长度:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="minLength" placeholder="请输入最小长度" 
                    v-model = "editAttribute.attrValidate.minLength" >
                </div>
            </div>
            <div class="form-group row">
                <label for="maxLength" class="col-sm-3 col-form-label-sm">最大长度:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="maxLength" placeholder="请输入最大长度" 
                    v-model = "editAttribute.attrValidate.maxLength" >
                </div>
            </div>
            <div class="form-group row">
                <label for="valueFrom" class="col-sm-3 col-form-label-sm">最小值:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="valueFrom" placeholder="请输入最小值" 
                    v-model = "editAttribute.attrValidate.valueFrom" >
                </div>
            </div>
            <div class="form-group row">
                <label for="valueTo" class="col-sm-3 col-form-label-sm">最大值:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="valueTo" placeholder="请输入最大值" 
                    v-model = "editAttribute.attrValidate.valueTo" >
                </div>
            </div>
            <div class="form-check form-check-inline">
                <label class="form-check-label" for="isRequired">是否必填</label>
                <div class="col-sm-4">
                    <input class="form-check-input" type="checkbox" id="isRequired" v-model="editAttribute.attrValidate.required">
                </div>
            </div>
            <div class="form-check form-check-inline">
                <label class="form-check-label" for="isEmail">是否Email</label>
                <div class="col-sm-4">
                    <input class="form-check-input" type="checkbox" id="isEmail" v-model="editAttribute.attrValidate.email">
                </div>
            </div>
            <div class="form-check form-check-inline">
                <label class="form-check-label" for="isPassword">是否password</label>
                <div class="col-sm-4">
                    <input class="form-check-input" type="checkbox" id="isPassword" v-model="editAttribute.attrValidate.password">
                </div>
            </div>
             <div class="form-check form-check-inline">
                <label class="form-check-label" for="isCustomized">是否可修改</label>
                <div class="col-sm-4">
                    <input class="form-check-input" type="checkbox" id="isCustomized" v-model="editAttribute.attrValidate.isCustomized">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
let hasAttrValidate;
export default {
    name:'AttrValidateEditor',
    props:['editAttribute'],
    methods:{
        hasAttrValidateChanged(event){
            if(event.target.checked){
                this.editAttribute.attrValidate={};
            }else{
                this.editAttribute.attrValidate=null;
            }
        }
    },
    mounted(){
        if(this.editAttribute.attrValidate){
            this.hasAttrValidate = true;
        }else{
            this.hasAttrValidate = false;
        }
    },
    data(){
        return {
            hasAttrValidate
        }
    }
}
</script>
<style>

</style>
