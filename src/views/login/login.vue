<template>
  <div class="login">
    <!-- login_container是背景div -->
    <div class="login_container">
      <!-- login_box是登录框div -->
      <div class="login_box">
        <!-- avatar_box是图片框 -->
        <div class="avatar_box">
          <!-- 登录图片 -->
          <img src="~assets/img/favicon.png" alt />
        </div>
        <!-- login_form是登录表单区域 -->
        <!-- :model是绑定data中的loginForm :rules绑定data中的loginRules -->
        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0px"
          class="login_form"
        >
          <!--  prop="name"是验证rules中的name规则 -->
          <el-form-item prop="username">
            <!-- 账号框 v-model是data里的数据 prefix-icon是ico图标-->
            <el-input v-model="loginForm.username" type="text" prefix-icon="el-icon-s-custom"></el-input>
          </el-form-item>
          <!--  prop="pass"是验证rules中的pass规则 -->
          <el-form-item prop="password">
            <!-- 密码框 v-model是data里的数据 prefix-icon是ico图标-->
            <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"></el-input>
          </el-form-item>
          <!-- btns是按钮区 -->
          <el-form-item class="btns">
            <!-- 登录按钮 点击后执行login方法-->
            <el-button type="primary" @click="logina" plain>登录</el-button>
            <!-- 重置按钮 点击后执行refLogin方法 -->
            <el-button type="info" @click="refLogin" plain>重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
// import { request } from "@/network/request.js";

export default {
  name: "login",
  // vue的数据函数
  data() {
    return {
      // 登录表单的数据对象
      loginForm: {
        // 账户数据
        username: "admin",
        // 密码数据
        password: "123456",
      },
      // 验证表单规则对象
      // 注意这里的连个验证对象需要和loginForm的数据名保持一致，否则会出现不管正不正确都会提示错误信息
      loginRules: {
        // 验证用户名是否符合
        username: [
          { required: true, message: "请输入登录账户", trigger: "blur" },
          { min: 3, max: 9, message: "长度在 3 到 9 个字符", trigger: "blur" },
        ],
        // 验证密码是否符合
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 9, message: "长度在 6 到 9 个字符", trigger: "blur" },
        ],
      },
    };
  },
  // vue的方法
  methods: {
    // 重置button点击后执行这个函数
    refLogin() {
      // 将ref为loginRef里的输入框清空，如果自带有数值清空时会输入自带的数值 resetFields()是elementui的清空方法
      this.$refs.loginRef.resetFields();
      this.loginForm.username = "";
      this.loginForm.password = "";
    },
    // 按钮提交时
    logina() {
      // 对表单验证
      this.$refs.loginRef.validate(async (value) => {
        // console.log(value); // 当使用方法时验证表单数据是否对应loginRules的验证规则,不是返回false是返回true
        // 当value为true时if不执行,为false时直接return空
        if (!value) return;
        // 将表单数据发送后返回的对象存入rest
        const rest = await this.$http.post("login", this.loginForm);
        // console.log(rest.data);
        // 因为rest数据里的status成功是200不成功不是,所以不等于200就失败 return后面的不执行
        if (rest.data.meta.status !== 200)
          return this.$message.error("登录失败!");
        this.$message({
          message: "登录成功",
          type: "success",
        });
        // console.log(rest);
        // 将token数据存储在临时本地存储中
        window.sessionStorage.setItem("token", rest.data.data.token);
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  // login页面背景色
  background-color: #2b4b6b;
  // 设置背景全高
  height: 100vh;
}
.login_box {
  // 登录框宽高
  width: 450px;
  height: 300px;
  background-color: #fff;
  // 设置圆角5px;
  border-radius: 5px;
  // 设置绝对定位，并左边距50%上边距50%
  position: absolute;
  left: 50%;
  top: 50%;
  // 减去自身的一半宽高;因为之前的50%对应的是box的左上角
  transform: translate(-50%, -50%);
  .avatar_box {
    // 设置图片框的宽高
    width: 100px;
    height: 100px;
    // 设置边框
    border: 1px solid #eee;
    // 设置圆角边框
    border-radius: 50%;
    padding: 10px;
    // 设置阴影色：偏移 0 0 10px宽 白色
    box-shadow: 0 0 10px #ddd;
    // 设置为绝对定位
    position: absolute;
    left: 50%;
    // 移动图片框自身的-50%x, -50%y
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      // 设置图片宽高
      widows: 100%;
      height: 100%;
      // 将图片切成圆形
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  // 设置为绝对定位
  position: absolute;
  // 设置底边距为0
  bottom: 0;
  width: 100%;
  padding: 0 15px;
  // 定义表单区域适应父元素
  box-sizing: border-box;
}
.btns {
  display: flex;
  // 设置对齐方式为容器尾部
  justify-content: flex-end;
  padding: 10px 0;
}
</style>