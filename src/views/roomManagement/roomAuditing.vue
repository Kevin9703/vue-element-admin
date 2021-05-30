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
          >审核</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      v-loading="detailLoading"
      :title="`房间详情`"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <div style="height: 350px; overflow-y: scroll">
        <h3>房屋名称</h3>
        <div>{{ currentClick.roomName }}</div>
        <el-divider />
        <div>
          <h3>房屋图片</h3>
          <el-carousel v-if="detailInfo.baseRoom" height="300px">
            <el-carousel-item
              v-for="item in detailInfo.baseRoom.roomImages"
              :key="item"
            >
              <h3 class="small">{{ item }}</h3>
            </el-carousel-item>
          </el-carousel>
          <el-carousel v-if="!detailInfo.baseRoom" height="300px">
            <el-carousel-item style="text-align: center">
              <h3 class="small">暂无图片</h3>
            </el-carousel-item>
          </el-carousel>
        </div>
        <el-divider />
        <h3>房源位置</h3>
        <div id="container" style="height: 200px" />
        <el-divider />
        <h3>房屋信息</h3>
        <div v-if="detailInfo.roomDetail">
          <p>
            <span class="title">设施</span>
            <span class="text">{{ detailInfo.roomDetail.amenities }}</span>
          </p>
          <p>
            <span class="title">公共区域</span>
            <span class="text">{{ detailInfo.roomDetail.publicSpace }}</span>
          </p>
          <p>
            <span class="title">描述</span>
            <span class="text">{{ detailInfo.roomDetail.description }}</span>
          </p>
          <p>
            <span class="title">交通</span>
            <span class="text">{{ detailInfo.roomDetail.recommendation }}</span>
          </p>
          <p>
            <span class="title">房屋规则</span>
            <span class="text">{{ detailInfo.roomDetail.houseRules }}</span>
          </p>
        </div>
        <el-divider />
        <h3>房屋价格</h3>
        <el-table
          v-if="detailInfo.roomPrices"
          :data="detailInfo.roomPrices.slice(0, currentDisplay * 5)"
          style="width: 100%"
        >
          <el-table-column prop="timeAbled" label="日期" width="180" />
          <el-table-column prop="price" label="价格" width="180" />
        </el-table>
        <div
          v-if="
            detailInfo.roomPrices &&
              currentDisplay * 5 <= detailInfo.roomPrices.length
          "
        >
          <el-button
            @click="currentDisplay = currentDisplay + 1"
          >显示更多</el-button>
        </div>
        <div
          v-if="
            detailInfo.roomPrices &&
              currentDisplay * 5 >= detailInfo.roomPrices.length
          "
        >
          <el-button @click="currentDisplay = 1">收起</el-button>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button
          type="danger"
          @click="reasonVisible = true"
        >不通过</el-button>
        <el-button type="primary" @click="pass">通 过</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="reasonVisible" title="不通过原因">
      <el-input
        v-model="reasonInput"
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="reasonVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提 交</el-button>
      </span>
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
      currentDisplay: 1
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
