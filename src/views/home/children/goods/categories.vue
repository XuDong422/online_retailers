<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <!-- path: '/'会改变到默认页面 如果:to="{ path: '/roles' }只会转到该页导航高亮不会改变,不会刷新 -->
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <!--  href="/users"刷新页面链接会改成 http://localhost:8080/www.baidu.com -->
      <el-breadcrumb-item>
        <a href="/users">商品管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      </el-row>
      <!-- 表格 -->
      <!-- 分类数据表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- "是否有效"栏位 -->
        <template v-slot:isOk="scope">
          <!-- 判断条件显示图标 -->
          <!-- 正确的图标，条件返会true执行返回false就使用错误的图标 -->
          <i
            class="el-icon-success"
            style="color: lightgreen;"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>

        <!-- 排序 -->
        <template v-slot:order="scope">
          <!-- 根据cat_level来确定是什么等级 -->
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template v-slot:opt="scope">
          <!-- 编辑和删除按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row)"
          >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区块要放在el-card的底部否则会离开卡片区 -->
      <!-- page-sizes是可以控制页面载入多少数据的 但第一次载入设置在queryInfo.pagesize -->
      <!-- layout是用来决定分页区显示那些部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
    <!-- 对话框的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogVisibleClose"
    >
    <!-- 编辑分类表单内容 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "categories",
  data() {
    return {
      // 接口查询参数
      queryInfo: {
        type: 3, // 3代表请求一二三级数据
        pagenum: 1, // 页码为第一页
        pagesize: 5, // 每页请求数据条数
      },
      // 商品数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // prop: 'cat_deleted',
          // 当前列定义为模本列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isOk",
        },
        {
          label: "排序",
          // 当前列定义为模本列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order",
        },
        {
          label: "操作",
          // 当前列定义为模本列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt",
        },
      ],
      // 添加分类对话框
      addDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 父分类ID
        cat_pid: 0,
        // 添加分类名称
        cat_name: "",
        // 分类层级
        cat_level: 0,
      },
      // 添加分类表单校验对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类列表
      parentCateList: [],
      // 指定父级选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        // 可以单独选择一级分类，功能等同 change-on-select
        checkStrictly: true,
      },
      // 选中父级分类的Id数组
      selectKeys: [],
      // 编辑分类验证对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 编辑分类对话框
      editDialogVisible: false,
      // 编辑分类对象
      editCateForm: {
        cat_name: "",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      // 将this.queryInfo交给params
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      // 判断是否成功
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }

      // 把数据列表，赋值给catelist
      this.cateList = res.data.result;
      // 为总数据条数赋值
      this.total = res.data.total;
    },
    // 显示添加分类对话框
    showAddDialog() {
      // 请求父级分类列表数据
      this.getParentCateList();
      // 显示添加分类对话框
      this.addDialogVisible = true;
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      // 将data数据放进parentCateList
      this.parentCateList = res.data;
    },
    // 点击添加分类
    async addCate() {
      // 判断是否发生变化
      this.handleChange();
      const { data: res } = await this.$http.post(
        "categories",
        this.addCateForm
      );
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg);
      };
      this.$message.success(res.meta.msg);

      // 重新请求分类列表数据
      this.getCateList();
      // 关闭请求数据
      this.addDialogVisible = false;
    },
        // 选项发生变化时触发这个函数
    handleChange() {
      // 判断父级id数组长度是否大于0,如果大于0代表选中了父级分类
      if (this.selectKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        // 为当前分类等级赋值
        this.addCateForm.cat_level = this.selectKeys.length;
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0;
        // 为当前分类等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 监听对话框关闭事件，重置表单数据
    addCateDialogClosed() {
      // 清空表单
      this.$refs.addCateFormRef.resetFields();
      // 清空级联框中选中的数据组数
      this.selectKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 显示编辑分类对话框
    async showEditDialog(row) {
      // 根据分类id请求分类对象信息
      const { data: res } = await this.$http.get(`categories/${row.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      // 将data数据存入editCateForm
      this.editCateForm = res.data;
      this.editDialogVisible = true;
    },
    // 删除分类
    async delCate(row) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      // 请求删除分类
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      this.$message.success(res.meta.msg);
      // 刷新数据
      this.getCateList();
    },
    // 关闭编辑分类对话框，重置表单
    editDialogVisibleClose() {
      // 清空表单
      this.$refs.editCateFormRef.resetFields();
    },
    // 点击确定，提交表单
    async editCate() {
      // 将数据进行提交
      const { data: res } = await this.$http.put(
        `categories/${this.editCateForm.cat_id}`,
        this.editCateForm
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      this.$message.success(res.meta.msg);
      // 关闭对话框
      this.editDialogVisible = false;
      // 刷新数据
      this.getCateList();
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      // 将新的数据存入pagesize
      this.queryInfo.pagesize = newSize;
      // 刷新数据
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      // 将新的数据存入pagenum
      this.queryInfo.pagenum = newPage;
      // 刷新数据
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
// 让树形控件有15px的底边框
.treeTable {
  margin-top: 15px;
}
// 让表单的宽为100%
.el-cascader {
  width: 100%;
}
</style>
