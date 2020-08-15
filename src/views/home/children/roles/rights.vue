<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <!-- path: '/'会改变到默认页面 如果:to="{ path: '/roles' }只会转到该页导航高亮不会改变,不会刷新 -->
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <!--  href="/users"刷新页面链接会改成 http://localhost:8080/www.baidu.com -->
      <el-breadcrumb-item>
        <a href="/rights">权限管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区块 -->
    <el-card>
      <!-- stripe为是否带有斑马纹路 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <!-- 渲染每个列表的权限 -->
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "rights",
  data() {
    return {
      // 创建一个权限列表对象
      rightsList: [],
    };
  },
  // 在生命周期函数 create中请求数据
  created() {
    this.getRightsList();
  },

  methods: {
    // 获取权限列表数据
    async getRightsList() {
      // 获取权限数据
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！");
      }
      // 将data数据存储在rightsList中
      this.rightsList = res.data;

      // console.log(this.rightsList);
    },
  },
};
</script>

<style>
</style>