<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- el-row代表行,里面嵌套el-col，
      el-row里面有gutter属性，属性为数字，则gutter前面加冒号,gutter属性代表el-col的间隔
      el-col里面有span属性，span为x，则分成24/x列-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === 1" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <!-- 操作列 修改地址和查看物流 -->
        <el-table-column label="操作">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAddressVisible"></el-button>
          <el-button type="warning" icon="el-icon-location" size="mini" @click="showProcess"></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页区块 -->
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
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressVisibleClose">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <!-- 地址区 -->
        <el-form-item label="省市区/县" prop="city">
          <el-cascader
            v-model="addressForm.city"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAdd">
          <el-input v-model="addressForm.detailAdd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流对话框 -->
    <!-- 修改地址对话框 -->
    <el-dialog title="查看物流" :visible.sync="processVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in processList"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  name: "orders",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orderList: [],
      // 如果键值名称相同，可以简写
      cityData,
      // 显示修改地址对话框
      addressVisible: false,
      // 地址表单对象
      addressForm: {
        city: [],
        detailAdd: "",
      },
      // 地址表单验证规则
      addressFormRules: {
        city: [{ required: true, message: "请选择省市县", trigger: "blur" }],
        detailAdd: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 是否显示物流对话框
      processVisible: false,
      // 快递进度信息
      processList: [],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      // 刷新数据
      this.getOrderList();
    },
    // pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      // 刷新数据
      this.getOrderList();
    },
    // 点击修改地址
    editAddressVisible() {
      this.addressVisible = true;
    },
    // 级联选择选项变化
    handleChange() {},
    // 关闭地址对话框
    addressVisibleClose() {
      this.addressForm.city = [];
      this.addressForm.detailAdd = "";
    },
    // 显示物流
    async showProcess() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.processList = res.data;
      this.processVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
// 设定地址栏的宽度
.el-cascader {
  width: 100%;
}
</style>
