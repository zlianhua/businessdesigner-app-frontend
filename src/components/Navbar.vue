<template>
  <b-navbar
    toggleable="md"
    type="dark"
    variant="info">
    <b-navbar-brand :to="{ name: 'Home' }">Asiainfo Business Designer</b-navbar-brand>
    <b-navbar-nav>
      <b-nav-item :to="{ name: 'BusinessComponent' }">Business Component</b-nav-item>
      <b-nav-item href="#">Web UI</b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>
<script>
export default {
  name: 'Navbar'
};
</script>