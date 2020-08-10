/* 用户上滑页面，滚动条触底，开始加载下一页数据
  1.找到滚动条触底事件
  2.判断是否有下一页数据
    获取总页数和当前的页码
    (总页数 = Math.ceil(总条数 / 页容量 pagesize))
  3.判断当前页码是否大于等于总页数 
*/

import {request} from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: '综合',
        isActive: true
      },
      {
        id: 1,
        value: '销量',
        isActive: false
      },
      {
        id: 2,
        value: '价格',
        isActive: false
      }
    ],
    goodsList: []
  },
  /* 接口要的参数 */
  QueryParams:{
    query: '',
    cid: '',
    pagenum: 1,
    pagesize: 10
  },
  /* 总页数 */
  totalPages:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.QueryParams.cid = options.cid;
    this.getGoodsList();
  },

  /* 获取商品列表数据 */
  async getGoodsList() {
    const res=await request({url:'/goods/search', data:this.QueryParams});
    console.log(res)
    /* 获取总条数 */
    const total = res.total;
    /* 计算总页数 */
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize)
    console.log('总页数:' + this.totalPages)
    this.setData({
      goodsList: [...this.data.goodsList, ...res.goods]
    })

    /* 关闭下拉刷新的窗口 */
    wx.stopPullDownRefresh();
  },

  /* 标题点击事件  从子组件传递过来 */
  handleTabsItemChange(e) {
    /* 获取被点击的标题索引 */
    const {index} = e.detail; /* const index = e.detail.index */
    /* 修改原数组 */
    let {tabs} = this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false)
    /* 赋值到data中 */
    this.setData({
      tabs
    })
  },
  /* 页面上滑，滚动条触底事件 */
  onReachBottom() {
    /* 判断有没有下一页数据 */
    if(this.QueryParams.pagenum >= this.totalPages) {
      console.log('没有下一页数据')
      wx.showToast({
        title: '没有更多商品啦'
      });
    } else {
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },
  /* 下拉刷新事件 */
  onPullDownRefresh() {
    /* 重置数组 */
    this.setData({
      goodsList: []
    })
    /* 重置页码 */
    this.QueryParams.pagenum = 1;
    /* 发送请求 */
    this.getGoodsList();
  }
})