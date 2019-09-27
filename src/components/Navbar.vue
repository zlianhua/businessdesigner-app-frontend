<template>
  <div>
    <b-navbar
      toggleable="md"
      type="dark"
      variant="info">
      <b-navbar-brand :to="{ name: 'Home' }">
        <img src="/static/images/asiainfo.png" width="30%" />
        Business Designer
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'BusinessComponent' }">业务构件</b-nav-item>
        <b-nav-item v-if="showBusinessApplication" :to="{ name: 'BusinessApplication' }">业务应用</b-nav-item>
        <b-nav-item v-if="showBusinessRules" :to="{ name: 'BusinessRules' }">业务规则</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>
<script>
const config = require('../../config/config.js');
let showBusinessApplication = config.showBusinessApplication;
let showBusinessRules = config.showBusinessRules;
export default {
  name: 'Navbar',
  data(){
    return {
      showBusinessApplication: showBusinessApplication,
      showBusinessRules:showBusinessRules
    }
  }
};
</script>