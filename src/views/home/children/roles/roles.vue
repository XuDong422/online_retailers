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
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区块 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="andDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- :class里面的是三元表达式,为了判断是否是第一个的列表是就在上面加一行 -->
            <el-row
              :class="['bdbottom',,'vcenter',i1 === 0 ? 'bdtop' : '']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过循环渲染二三级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级循环 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级循环 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <!-- index是非零开始的索引号 username是userlist数组的值 label是显示在栏位上的名字区 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="330px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeUsers(scope.row.id)"
            >删除</el-button>
            <!-- 这里的函数之所以要用 .row而不用id是因为函数的递归需要-->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="small"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的弹窗信息 -->
    <el-dialog title="修改角色" :visible.sync="andDialogVisible" width="30%" @close="addHandleClose">
      <!-- 内容表单区域 -->
      <el-form :model="addForm" :rules="addrules" ref="addFormRef" label-width="100px">
        <!-- 添加角色的表单内容 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="andDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框  -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%" @close="editHandleClose">
      <!-- 修改信息表单区 -->
      <el-form :model="editForm" :rules="addrules" ref="editFormRef" label-width="100px">
        <!-- 修改角色的表单内容 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
    <!-- 将权限数据用tree树形图表示 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roles",
  data() {
    return {
      // 存储所有角色的列表
      rolelist: [],
      // 控制添加角色弹窗的显隐
      andDialogVisible: false,
      // 添加角色角色表单数据对象
      addForm: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      // 添加角色的表单规则
      addrules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 15, message: "角色名长度在3-9位数", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入描述", trigger: "blur" },
          { min: 1, max: 50, message: "描述长度在3-9位数", trigger: "blur" },
        ],
      },
      // 将用来修改角色信息对象存在这里
      editForm: {},
      // 控制修改角色弹窗的显隐
      editDialogVisible: false,
      // 控制分配权限弹窗的显隐
      showSetDialogVisible: false,
      // 将权限列表存储在这里
      rightslist: [],
      // 树形控件的绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 存储默认选中的id值数值
      defKeys: [],
      // 分配的权限保存
      roleId: "",
    };
  },
  // 生命周期函数在第一时间执行函数体
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      // 获取角色列表 结构为res
      const { data: res } = await this.$http.get("roles");
      // 判断是否请求成功 失败的话在弹窗后不执行后面的代码
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败!请刷新!");
      }
      // 成功后将res.data的内容赋值给rolelist
      this.rolelist = res.data;
      // 弹窗获取角色成功
      this.$message.success("获取角色列表成功!");
    },
    // 添加角色对话框关闭时清空输入
    addHandleClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 在添加角色前预检验
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(this.addForm);
        if (!valid) return;
        // 验证通过时发起请求添加角色
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          console.log(res);
          this.$message.error("添加失败");
        } else {
          this.$message.success("添加成功");
          // 将添加角色弹窗隐藏
          this.andDialogVisible = false;
          // 刷新页面数据
          this.getRolesList();
        }
      });
    },
    // 展示编辑角色的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("roles/" + id);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      // 将请求到的最新数据存入editForm
      this.editForm = res.data;
      // 将编辑角色对话框显示
      this.editDialogVisible = true;
    },
    // 将修改框的内容在关闭的时候清除
    editHandleClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改信息并提交
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        // 当确认验证不成功时，直接return
        if (!valid) return;
        // 验证通过时发起修改角色请求
        const { data: res } = await this.$refs.editFormRef.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        // 判断是否修改成功
        if (res.meta.status !== 200) {
          return this.$message.error("角色修改失败！");
        } else {
          // 将编辑角色对话框隐藏
          this.editDialogVisible = false;
          // 刷新页面数据
          this.getRolesList();
          // 提示修改成功
          this.$message.success("角色修改成功！");
        }
      });
    },
    // 删除角色
    async removeUsers(id) {
      // element MessageBox弹框 删除角色对话框
      //如果角色确认删除，则返回值为字符串confirm
      //如果角色取消了删除，则返回值为字符串cancel
      const config = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      // api删除角色 并将结果解构为res
      const { data: res } = await this.$http.delete("roles/" + id);
      // 判断是否成功,成功返回status=200
      if (res.meta.status !== 200) {
        return this.$message({
          type: "warning",
          message: "删除角色失败",
        });
      }
      // 如果删除成功就会跳过上面的if 执行以下代码
      this.$message({
        type: "success",
        message: "删除角色成功!",
      });
      // 刷新页面数据
      this.getRolesList();
    },

    async removeRightById(role, rightId) {
      const config = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
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
      // api删除角色 并将结果解构为res
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      // 判断是否成功,成功返回status=200
      if (res.meta.status !== 200) {
        return this.$message({
          type: "warning",
          message: "删除权限失败",
        });
      }
      // 如果删除成功就会跳过上面的if 执行以下代码
      this.$message({
        type: "success",
        message: "删除权限成功!",
      });
      // 刷新页面数据
      // this.getRolesList();
      role.children = res.data;
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限列表
      const { data: res } = await this.$http.get("rights/tree");
      // 判断是否成功,成功返回status=200
      if (res.meta.status !== 200) {
        return this.$message({
          type: "warning",
          message: "获取权限失败",
        });
      }
      // 将获得的权限数据存储在data里
      this.rightslist = res.data;
      this.$message({
        type: "success",
        message: "获取权限成功!",
      });
      // 递归获取三级节点列表
      this.getLeafKey(role, this.defKeys);
      // 控制分配权限弹窗的显隐
      this.showSetDialogVisible = true;
    },
    // 递归调用函数，获取三级节点的id
    getLeafKey(node, arr) {
      // 如果节点不存在children属性，说明是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      // 遍历node节点
      node.children.forEach((item) => {
        this.getLeafKey(item, arr);
      });
    },
    // 关闭权限对话框
    setRightDialogClose() {
      // 清空勾选的权限
      this.defKeys = [];
    },
    // 分配角色权限
    async allotRights() {
      // 获取点击的权限的id,分为三级全选和 一二级半选
      var keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // 将id数组用,分割
      var idStr = keys.join(",");
      // 将分配的权限id发送出去
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功");
      // 刷新数据
      this.getRolesList();
      // 关闭对话窗
      this.showSetDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
// 让权限列表右下边距
.el-tag {
  margin: 7px;
}
// 在行下加一条线
.bdtop {
  border-top: 1px solid #eee;
}
// 在行上加一条线  根据上面的三元表达式判断加不加
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 让权限列表居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
