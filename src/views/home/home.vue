<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  name: "login",
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
      return this.$message.error("退出登录!");
    },
  },
};
</script>
<style lang="less" scoped>
</style>