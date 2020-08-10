import {request} from '../../request/index'

Page({
  data: {
    swiperList: [],
    catesList: [],
    floorList: []
  },
  //页面开始加载 就会触发
  onLoad: function(options) {
    this.getSwiperList();
    this.getCatesList();
    this.getFloorList();
  },
  //获取轮播图数据
  getSwiperList() {
    request({url:"/home/swiperdata"})
    .then(result => {
      this.setData({
        swiperList: result
      })
    })
  },
  //获取分类导航数据
  getCatesList() {
    request({url:"https://api-hmugo-web.itheima.net/api/public/v1/home/catitems"})
    .then(result => {
      this.setData({
        catesList: result.data.message
      })
    })
  },
  //获取楼层数据
  getFloorList() {
    request({url:"/home/floordata"})
    .then(result => {
      this.setData({
        floorList: result
      })
    })
  },
});
  