<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <!-- 图标logo -->
        <img src="@/assets/img/favicon.png" alt />
        <!-- 标题 -->
        <span>单页后台管理系统</span>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题部分 -->
    <el-container class="container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? ' 65px' : ' 200px'">
        <div class="toggle-button" @click="toggle">| | |</div>
        <!-- 侧边栏菜单区域 -->
        <!-- unique-opened让导航栏只选择一个其他收起 也可以写成:unique-opened="true" -->
        <el-menu
          :collapse="isCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          :router="true"
          :default-active="dapath"
        >
          <!-- 一级菜单1 -->
          <!-- 将存储的menuslist循环出来 因为index不能接收数字,加字符空形成字符串 -->
          <el-submenu :index="item.id + ''" v-for="item in menuslist" :key="item.id">
            <!-- title槽 -->
            <template slot="title">
              <!-- 一级菜单图标 根据item.id循环icos的数据-->
              <i :class="icos[item.id]"></i>
              <!-- 文本一 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单1 -->
            <!-- 循环item.id里的数据  -->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
            >
              <!-- 根据subitem.id循环icoes的数据 -->
              <i :class="icoes[subitem.id]"></i>
              {{subitem.authName}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- home的子路由 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: "login",
  data() {
    return {
      // 接收左侧菜单栏数据
      menuslist: [],
      // 一级菜单栏图标
      icos: {
        125: "el-icon-s-custom",
        103: "el-icon-s-check",
        101: "el-icon-menu",
        102: "el-icon-s-order",
        145: "el-icon-data-analysis",
      },
      // 二级菜单栏图标
      icoes: {
        110: "el-icon-user",
        111: "el-icon-key",
        112: "el-icon-lock",
        104: "el-icon-copy-document",
        115: "el-icon-edit-outline",
        121: "el-icon-folder",
        107: "el-icon-files",
        146: "el-icon-data-line",
      },
      // 菜单栏收展判断
      isCollapse: false,
      dapath: "/user",
    };
  },
  // 一创建就加载
  created() {
    this.getMenList();
    this.dapath = this.$route.path;
  },
  // vue方法
  methods: {
    // 退出登录
    logout() {
      // 将临时本地存储的token清除
      window.sessionStorage.clear();
      // 跳回login登录页
      this.$router.push("/login");
      // 弹出警告框 退出登录
      return this.$message.warning("退出登录!");
    },
    // 获取菜单栏
    async getMenList() {
      // 获取菜单数据
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // 将data数据存入menuslist数组中
      this.menuslist = res.data;
      // console.log(res);
    },
    // 菜单栏收展
    toggle() {
      this.isCollapse = !this.isCollapse;
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  // 设置页面去掉顶栏60px;
  height: calc(100vh - 60px);
}
.el-header {
  background-color: rgb(84, 92, 100);
  display: flex;
  // 设计间距对齐
  justify-content: space-between;
  // 设置flex子项水平居中
  align-items: center;
  // 设置文字白色
  color: #fff;
  img {
    // 设置图片高
    height: 55px;
  }
  div {
    // 设置flex布局
    display: flex;
    // 设置flex子项水平居中
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  // 设置侧边栏背景色
  background-color: rgb(255, 255, 255);
}
.el-main {
  // 设置右主题背景色
  background-color: rgb(234, 237, 241);
}
.toggle-button {
  // 定义div里的大小
  font-size: 10px;
  line-height: 24px;
  // 设置字符颜色
  color: rgb(48, 49, 51);
  // 文本居中
  text-align: center;
  // 设置鼠标样式
  cursor: pointer;
  // 背景色
  background-color: rgb(64, 158, 255);
  width: 100%;
  // 加一个1px的边框
  border-right: solid 1px #e6e6e6;
  // 因为那1px边框需要减少1pxdiv
  margin-left: -1px;
}
</style>