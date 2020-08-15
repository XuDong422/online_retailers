<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/params">参数列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- Alert 警告 自定义关闭按钮 center为居中 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" center type="warning" show-icon></el-alert>
      <!-- 商品分类选择区 -->
      <el-row class="cat_opt">
        <span>选择商品分类:</span>
        <el-cascader
          v-model="selectKeys"
          :options="cateList"
          :props="cateListProps"
          @change="handleChange"
          clearable
        ></el-cascader>
      </el-row>
      <!-- 动态参数区 -->
      <el-row>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="动态参数" name="many">
            <!-- 动态参数按钮 -->
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisable"
              @click="addDialogVisible = true"
            >添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border>
              <!-- 可扩展列 -->
              <el-table-column type="expand">
                <template v-slot="scope">
                  <!-- 循环出标签 -->
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClose(i,scope.row)"
                  >{{item}}</el-tag>
                  <!-- 输入框 -->
                  <!-- @keyup.enter.native点击回车后执行 @blur失去焦点执行 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <!-- 增加框，在最后面加一个输入框这样可以将标签动态增加  确定增加就显示上面的参数输入框-->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index" label="#"></el-table-column>
              <!-- 标题 -->
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 静态属性区 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisable"
              @click="addDialogVisible = true"
            >添加属性</el-button>

            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border>
              <!-- 扩展列 -->
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClose(i,scope.row)"
                  >{{item}}</el-tag>
                  <!-- 属性输入框 -->
                  <!-- @keyup.enter.native点击回车后执行 @blur失去焦点执行 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <!-- 增加框，在最后面加一个输入框这样可以将标签动态增加  确定增加就显示上面的参数输入框-->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <!-- 标题 -->
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogVisibleClose"
    >
      <!-- 参数表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="eidtDialogVisibleClose"
    >
      <!-- 参数表单区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  data() {
    return {
      // 商品分类列表数据
      cateList: [],
      // 级联选择框的配置对象
      cateListProps: {
        // hover 触发子菜单
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中父级分类的Id数组
      selectKeys: [],
      // 被激活页签的名字
      activeName: "many",
      // 动态参数表格
      manyTableData: [],
      // 静态属性表格
      onlyTableData: [],
      // 打开添加参数对话框
      addDialogVisible: false,
      // 新添加的参数表单对象
      addForm: {
        attr_name: "",
      },
      // 添加参数表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名", trigger: "blur" },
        ],
      },
      // 显示修改参数对话框
      editDialogVisible: false,
      // 编辑参数对象
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名", trigger: "blur" },
        ],
      },
      // 文本输入框显示与隐藏
      inputVisible: false,
      // 文本输入框的值
      inputValue: "",
    };
  },
  // 生命周期函数 在实例创建后立即执行
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品的分类列表
    async getCateList() {
      // 发送获取请求
      const { data: res } = await this.$http.get("categories");
      // 判断是否获取成功
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      // 将data赋值给cateList
      this.cateList = res.data;
    },
    // 选项发生变化时触发这个函数
    handleChange() {
      // 刷新数据
      this.getParamsList();
    },
    // tab 页签点击事件的处理函数
    handleClick() {
      // 刷新数据
      this.getParamsList();
    },
    // 获取参数列表数据
    async getParamsList() {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = [];
        this.onlyTableData = [];
        this.manyTableData = [];
        return;
      };

      // 请求参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };

      // 把res.data目录下的数组中的attr_vals字符串转化成字符串数组
      res.data.forEach((item) => {
        // 字符串attr_vals中通过空格分隔
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // 为每个item添加一个bool类型inputVisible，显示或隐藏文本框
        item.inputVisible = false;
        // 文本框的值
        item.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
        // 请求参数列表成功
      } else {
        this.onlyTableData = res.data;
        // 请求参数列表成功
      };
    },
    // 关闭添加参数对话框触发
    addDialogVisibleClose() {
      // 触发关闭，清空表单内容
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，添加参数
    addParams() {
      // 进行表单校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (valid) {
          // 将数据发送给服务器
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg);
          };
          this.$message.success(res.meta.msg);
          // 重新请求参数列表
          this.getParamsList();
          // 关闭对话框
          this.addDialogVisible = false;
        }
      });
    },
    // 显示修改参数对话框
    async showEditDialog(id) {
      // 获取参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      // 将数据保存到修改参数对象中
      this.editForm = res.data;
      // 打开对话窗
      this.editDialogVisible = true;
    },
    // 关闭编辑参数对话框触发
    eidtDialogVisibleClose() {
      // 重置表单
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮，修改参数
    editParams() {
      // 校验格式
      this.$refs.editFormRef.validate(async (valid) => {
        if (valid) {
          // 传送请求
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          };
          this.$message.success(res.meta.msg);
          // 刷新参数
          this.getParamsList();
          // 关闭对话框
          this.editDialogVisible = false;
        }
      });
    },
    // 删除参数
    async removeParams(id) {
      const confirm = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirm !== "confirm") {
        return this.$message.info("已取消删除！");
      };
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      };
      this.$message.success(res.meta.msg);
      // 重新请求参数列表
      this.getParamsList();
    },
    // 点击新添加Tag按钮
    showInput(row) {
      row.inputVisible = true;
      // $nextTick方法作用：当页面元素被重新渲染后，才会指定回调函数中的代码
      // 当inputVisible被重置为true后，需要重新渲染页面元素，所以需要在这个函数中获取文本对象，否则无效
      this.$nextTick((_) => {
        // 获取文本框dom对象，获取焦点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 文本框按下enter键或失去焦点
    handleInputConfirm(row) {
      // 判断输入内容是否有效，即去除空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      };
      // 如果没有return， 将输入的内容添加到attr_vals中
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      // 发起网络请求保存修改到数据库
      this.saveAttrVals(row);
    },
    // 保存attr_vals中的改变，保存到数据库中
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );

      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getParamsList();
    },
    // 删除tag标签，保存修改到数据库中
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用返回true,否则返回false
    isBtnDisable() {
      if (this.selectKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 分类的三级ID
    cateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2];
      }
      return null;
    },
    // 计算动态参数还是静态属性文本
    titleText() {
      if (this.activeName === "only") {
        return "静态属性";
      }
      return "动态参数";
    },
  },
};
</script>

<style lang="less" scoped>
// 为商品分类设置一个边距
.cat_opt {
  margin: 15px 0;
}
// 给el-tag标签添加左边距
.el-tag {
  margin-left: 15px;
}
// 设置参数输入框
.input-new-tag {
  width: 100px;
  margin-left: 15px;
}
// 设置添加参数按钮
.button-new-tag {
  width: 100px;
  margin-left: 15px;
}
</style>