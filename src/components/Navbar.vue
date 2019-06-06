<template>
  <div>
    <b-navbar
      toggleable="md"
      type="dark"
      variant="info">
      <b-navbar-brand :to="{ name: 'Home' }">
        <!-- <img src="../assets/xxxxlog.png" width="30%" /> -->
        Business Designer
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'BusinessComponent' }">业务构件</b-nav-item>
        <b-nav-item :to="{ name: 'BusinessApplication' }">业务应用</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>
<script>
export default {
  name: 'Navbar'
};
</script>