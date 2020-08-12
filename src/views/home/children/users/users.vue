<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <!-- path: '/'会改变到默认页面 如果:to="{ path: '/roles' }只会转到该页导航高亮不会改变,不会刷新 -->
      <el-breadcrumb-item :to="{ path: '/roles' }">首页</el-breadcrumb-item>
      <!--  href="/users"刷新页面链接会改成 http://localhost:8080/www.baidu.com -->
      <el-breadcrumb-item>
        <a href="/users">用户管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 简单卡片 -->
    <el-card>
      <!-- gutter是设置组件间距的距离 -->
      <el-row :gutter="20">
        <!-- span设置组件宽度 -->
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <!-- 搜索与添加 -->
            <!-- 还有bug只能搜索当前页内容 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <!-- 搜索按钮 点击后更新数据数据会根据 上面修改的queryInfo.query更新-->
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <!-- span设置组件宽度 -->
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <!-- 添加用户button -->
            <el-button type="primary" @click="andDialogVisible = true">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <!-- index是非零开始的索引号 username是userlist数组的值 label是显示在栏位上的名字区 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="scope">
            <!-- template上绑定从el-table-column传过来的数据scope，他返回的是一个对象，row返回的是当前行下的数据 -->
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <!-- 修改按钮 -->
            <!-- scope.row.id是将这行的id传过去进行查询 -->
            <el-tooltip class="item" effect="dark" content="修改权限" placement="top">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUsers(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 设置按钮 -->
            <el-tooltip class="item" effect="dark" content="分配用户" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区块 -->
      <!-- page-sizes是可以控制页面载入多少数据的 但第一次载入设置在queryInfo.pagesize -->
      <!-- layout是用来决定分页区显示那些部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的弹窗信息 -->
    <el-dialog title="添加用户" :visible.sync="andDialogVisible" width="30%" @close="addHandleClose">
      <!-- 内容表单区域 -->
      <el-form :model="addForm" :rules="addrules" ref="addFormRef" label-width="100px">
        <!-- 添加用户的表单内容 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="andDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框  -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%" @close="editHandleClose">
      <!-- 修改信息表单区 -->
      <el-form :model="editForm" :rules="addrules" ref="editFormRef" label-width="100px">
        <!-- 修改用户的表单内容 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "users",
  data() {
    // 添加用户的验证规则,邮箱部分
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        callback();
      }
      return callback(new Error("请输入合法的Email"));
    };
    // 添加用户的验证规则,手机部分
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        callback();
      }
      return callback(new Error("请输入合法的电话"));
    };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 绑定搜索框的内容
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据 这里是实际控制 el-pagination是选择多少页
        pagesize: 10,
      },
      // 存储管理员名单
      userlist: [],
      // total
      total: 0,
      // 控制添加用户弹窗的显隐
      andDialogVisible: false,
      // 控制修改用户弹窗的显隐
      editDialogVisible: false,
      // 添加用户角色表单数据对象
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加用户的表单规则
      addrules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 9, message: "用户名长度在3-9位数", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 9, message: "密码长度在3-9位数", trigger: "blur" },
        ],
        email: [
          { required: true, message: "请输入email", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 修改用户的表单规则  因为可以直接调用addrules的表单规则所以不需要再开一个验证
      // editFormRules: {
      //   email: [
      //     { required: true, message: "请输入email", trigger: "blur" },
      //     { validator: checkEmail, trigger: "blur" },
      //   ],
      //   mobile: [
      //     { required: true, message: "请输入手机号码", trigger: "blur" },
      //     { validator: checkMobile, trigger: "blur" },
      //   ],
      // },
      // 将返回的用户信息对象存在这里
      editForm: {},
    };
  },
  created() {
    // 页面加载就执行getUserList()函数
    this.getUserList();
  },
  methods: {
    // 获取用户数据
    async getUserList() {
      // 将获取的数据解析
      const { data: res } = await this.$http.get("users", {
        // 根据queryInfo里的条件收纳数据
        params: this.queryInfo,
      });
      // 数据获取的不成功就弹出失败
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败!请刷新!");
      // 数据获取成功就弹出成功
      this.$message.success("获取用户列表成功!");
      // 将管理员名单放入userlist
      this.userlist = res.data.users;
      // console.log(this.userlist);
      // 将total放入total
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听pagesize改变的事件
    handleSizeChange(val) {
      // console.log(val);
      this.queryInfo.pagesize = val;
      // 刷新数据
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(val) {
      // console.log(val);
      this.queryInfo.pagenum = val;
      // 刷新数据
      this.getUserList();
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      // 判断是否更新成功
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户列表失败!");
      } else {
        this.$message.success("更新用户列表成功!");
      }
    },
    // 添加用户对话框关闭时清空输入
    addHandleClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 在添加用户前预检验
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(this.addForm);
        if (!valid) return;
        // 验证通过时发起请求添加用户
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          console.log(res);
          this.$message.error("添加失败");
        } else {
          this.$message.success("添加成功");
          // 将添加用户弹窗隐藏
          this.andDialogVisible = false;
          // 刷新页面数据
          this.getUserList();
        }
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("users/" + id);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      // 将请求到的最新数据存入editForm
      this.editForm = res.data;
      // 将编辑用户对话框显示
      this.editDialogVisible = true;
    },
    // 将修改框的内容在关闭的时候清除
    editHandleClose() {
      this.$refs.editFormRef.resetFields();
      // console.log(this.editForm);
    },
    // 修改信息并提交
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        // 当确认验证不成功时，直接return
        if (!valid) return;
        console.log(this.editForm);
        // 验证通过时发起修改用户请求
        const { data: res } = await this.$refs.editFormRef.$http.put(
          "users/" + this.editForm.id,
          {
            mobile: this.editForm.mobile,
            email: this.editForm.email,
          }
        );
        // 判断是否修改成功
        if (res.meta.status !== 200) {
          return this.$message.error("用户修改失败！");
        } else {
          // 将编辑用户对话框隐藏
          this.editDialogVisible = false;
          // 刷新页面数据
          this.getUserList();
          // 提示修改成功
          this.$message.success("用户修改成功！");
        }
      });
    },
    // 删除用户
    async removeUsers(id) {
      // element MessageBox弹框 判断是否真的要删除
      //如果用户确认删除，则返回值为字符串confirm
      //如果用户取消了删除，则返回值为字符串cancel
      const config = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果选择取消 config就等于cancel cancel不等于confirm 为true执行里面的代码
      // 如果选择删除 config就等于confirm confirm等于confirm 为false不执行里面的代码 跳过
      if (config !== "confirm") {
        return this.$message({
          type: "info",
          message: "已取消删除",
        });
      }
      // api删除用户 并将结果解构为res
      const { data: res } = await this.$http.delete("users/" + id);
      // 判断是否成功,成功返回status=200
      if (res.meta.status !== 200) {
        return this.$message({
          type: "warning",
          message: "删除用户失败",
        });
      }
      // 如果删除成功就会跳过上面的if 执行以下代码
      this.$message({
        type: "success",
        message: "删除用户成功!",
      });
      // 刷新页面数据
      this.getUserList();
    },
  },
};
</script>
 
<style>
</style>