<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- element进度条 -->
      <!-- 左侧小导航 字符串-0 会转化成数值 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 将表单的数据与addForm,v-model才是双向绑定 验证规则addFormRules -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeLeave"
          @tab-click="tabClickd"
        >
          <!-- 根据activeIndex的数值跳转到 name为"0"的模块 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片上传 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- el-upload是element的Upload 上传  :action：是图片的上传地址  :headers设置上传的请求头部 -->
            <!-- :on-preview 已上传的文件时的钩子 :on-remove	移除文件时的钩子 :on-success	文件上传成功时的钩子 -->
            <el-upload
              class="upload-demo"
              :action="this.imgUploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 导入富文本编辑区 数据动态绑定addForm.goods_introduce -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览区域根据previewImgVisible判断是否显示 -->
      <el-dialog title="预览图片" :visible.sync="previewImgVisible" width="50%">
        <img :src="previewPath" alt class="previewImg" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 引入lodash库
import _ from "lodash";
export default {
  name: "add",
  data() {
    return {
      // 根据activeIndex跳转到选定模块
      activeIndex: "0",
      // 添加表单对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品类别id数组
        goods_cat: [],
        // 上传图片临时对象数组
        pics: [],
        // 商品简介
        goods_introduce: "",
        // 动态参数和静态属性
        attrs: [],
      },
      // 表单验证规则
      addFormRules: {
        // required为true代表是必填项,trigger: "blur"代表焦点离开后检验规则
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分类数组
      cateList: [],
      // 级联分类规则
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 动态参数数组
      manyTableData: [],
      // 商品属性数组
      onlyTableData: [],
      // 上传图片地址http://api.zreai.com:606/api/private/v1/upload
      imgUploadURL: "http://api.zreai.com:606/api/private/v1/upload",
      // 图片上传使用内部封装的axjx，需要为其指定token
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片预览地址
      previewPath: "",
      // 是否显示图片预览对话框
      previewImgVisible: false,
    };
  },
  // 生命周期函数 生成实例就执行
  created() {
    this.getCateList();
  },
  // 函数
  methods: {
    // 获取商品分类列表
    async getCateList() {
      // 获取商品分类
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data;
    },
    // 商品类别改变时，触发
    handleChange() {
      // 判断选择的分类是否为一级或二级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
    },
    // 离开标签页触发 activeName, oldActiveName是钩子函数里的
    beforeLeave(activeName, oldActiveName) {
      // 判断商品分类是否有选择,没有就不执行跳转
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选者商品分类！");
        return false;
      }
    },
    // 点击tab触发
    async tabClickd() {
      // 请求分类对应的动态参数
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        // 将res的数据加空格
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        // 请求静态属性
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.onlyTableData = res.data;
      }
    },
    // 点击图片预览触发
    handlePreview(file) {
      // 将图片路径存入previewPath以便展示的时候使用
      this.previewPath = file.response.data.url;
      // 打开图片展示框
      this.previewImgVisible = true;
    },
    // 移除图片触发
    handleRemove(file) {
      // 获取图片在服务器上的临时地址
      const uploadURL = file.response.data.tmp_path;
      // 根据图片地址查找其在addForm的pics中的下标
      const i = this.addForm.pics.findIndex((item) => item.pic === uploadURL);
      // 删除对应下标项
      this.addForm.pics.splice(i, 1);
    },
    // 上传成功触发
    handleSuccess(response) {
      // 将返回的图片的临时地址保存到商品表单中
      const picURL = { pic: response.data.tmp_path };
      // const picURL = {
      //   pic: response.data.tmp_path,
      // };
      this.addForm.pics.push(picURL);
    },
    // 点击添加商品
    add() {
      // 添加商品前的表单预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单预验证！");
        }
        // 执行添加商品操作
        // 将addForm 中的goods_cat转化成由逗号分隔的字符串,为了不影响级联选择框使用，深度拷贝一份
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });

        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;

        // 添加商品
        const { data: res } = await this.$http.post("/goods", form);

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        // 跳转到商品列表页
        this.$router.push("/goods");
      });
    },
  },
  // 计算属性
  computed: {
    // 计算分类ID
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        // 返回下标为2的元素，即三级分类Id
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
// 将el-checkbox加边距
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
// 图片展示框里的图片宽为100%
.previewImg {
  width: 100%;
}
// 给添加商品按钮加上边距
.addBtn {
  margin-top: 15px;
}
</style>
