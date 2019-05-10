<template>
    <div>
        <form @submit.prevent>
            <div class="form-group row">
                <label for="address" class="col-sm-3 col-form-label-sm">address:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="address" placeholder="è¯·è¾å¥address"
                    :value = "entityObject.address" @change = "nameChanged($event)" required>
                </div>
                <label for="zipCode" class="col-sm-3 col-form-label-sm">zipCode:</label>
                <div class="col-sm-9">
                    <input type="text" class="form-control col-form-label-sm" id="zipCode" placeholder="è¯·è¾å¥zipCode"
                    :value = "entityObject.zipCode" @change = "nameChanged($event)" required>
                </div>
            </div>
        </form>    
    </div>
</template>
<script>
export default {
    name: changeAddressFormEditor,
    props:['entityObject'],
    methods: {
    }
}
</script>    