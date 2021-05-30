<template>
  <div>
    <el-table v-loading="loading" :data="tableData" style="width: 100%">
      <el-table-column prop="userName" label="房主" width="180" />
      <el-table-column prop="roomName" label="房间名" width="180" />
      <el-table-column prop="category" label="种类" />
      <el-table-column prop="type" label="房源类型" />
      <el-table-column prop="basePrice" label="价格" />
      <el-table-column prop="location" label="地址" />
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button
            fixed="right"
            type="text"
            size="small"
            @click="open(scope.row)"
          >编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      v-loading="detailLoading"
      :title="`房间信息管理`"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <div style="height: 400px; overflow-y: scroll">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="活动名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="活动区域">
            <el-select v-model="form.region" placeholder="请选择活动区域">
              <el-option label="区域一" value="shanghai" />
              <el-option label="区域二" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="活动时间">
            <el-col :span="11">
              <el-date-picker
                v-model="form.date1"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-time-picker
                v-model="form.date2"
                placeholder="选择时间"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
          <el-form-item label="即时配送">
            <el-switch v-model="form.delivery" />
          </el-form-item>
          <el-form-item label="活动性质">
            <el-checkbox-group v-model="form.type">
              <el-checkbox label="美食/餐厅线上活动" name="type" />
              <el-checkbox label="地推活动" name="type" />
              <el-checkbox label="线下主题活动" name="type" />
              <el-checkbox label="单纯品牌曝光" name="type" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="特殊资源">
            <el-radio-group v-model="form.resource">
              <el-radio label="线上品牌商赞助" />
              <el-radio label="线下场地免费" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="活动形式">
            <el-input v-model="form.desc" type="textarea" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">立即创建</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoomList, passReview, failReview, getRoomDetail } from '@/api/room'
export default {
  data() {
    return {
      dialogVisible: false,
      currentClick: {},
      tableData: [],
      loading: false,
      detailLoading: false,
      detailInfo: {},
      reasonInput: '',
      reasonVisible: false,
      currentDisplay: 1,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  watch: {
    currentClick() {
      this.getReviewRoomDetail(this.currentClick.rId)
      this.currentDisplay = 1
    }
  },
  created() {
    this.getAllRoom()
  },
  methods: {
    onSubmit() {
      console.log('submit!')
    },
    async submit() {
      const { state } = await failReview({
        rId: this.currentClick.rId,
        msg: this.reasonInput
      })
      state === '1' && this.$message.success('操作成功')
      this.dialogVisible = false
      this.reasonVisible = false
    },
    async pass() {
      const { state } = await passReview(this.currentClick.rId)
      state === '1' && this.$message.success('操作成功')
      this.dialogVisible = false
    },
    open(row) {
      this.currentClick = row
      this.dialogVisible = true
    },
    async getAllRoom() {
      this.loading = true
      const { data } = await getRoomList()
      this.tableData = data
      this.loading = false
    },
    async getReviewRoomDetail(id) {
      this.detailLoading = true
      const { data } = await getRoomDetail(id)
      this.detailInfo = data
      if (data.roomDetail && data.roomDetail.locationDetail) {
        try {
          const location = data.roomDetail.locationDetail.split(',')
          // eslint-disable-next-line no-undef
          this.map = new AMap.Map('container', {
            zoom: 14, // 级别
            center: location, // 中心点坐标
            viewMode: '3D' // 使用3D视图
          })
          // eslint-disable-next-line no-undef
          var marker = new AMap.Marker({
            // eslint-disable-next-line no-undef
            position: new AMap.LngLat(location[0], location[1]) // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          })
          this.map.add(marker)
        } catch (err) {
          console.log(err)
          this.detailLoading = false
        }
      }
      this.detailLoading = false
    }
  }
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
.title {
  color: rgb(28, 132, 135);
}
.text {
  margin-left: 5px;
  color: #9a9a9a;
}
</style>
