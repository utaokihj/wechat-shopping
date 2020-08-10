import {request} from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsObj: {},
    isCollect: false
  },
  /* 商品对象 */
  Goodsinfo: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    /* 拿到当前页面栈 */
    let pages =  getCurrentPages();
    /* 当前页面对象 */
    let currentPage = pages[pages.length-1];
    let options = currentPage.options;
    const {goods_id} = options;
    this.getGoodsDetail(goods_id);
  },
  /* 获取商品详情数据 */
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({url:"/goods/detail", data:{goods_id}})
    console.log(goodsObj)
    this.Goodsinfo = goodsObj;
    /* 缓存中商品收藏数组 */
    let collect = wx.getStorageSync("collect") || [];
    let isCollect = collect.some(v => v.goods_id === this.Goodsinfo.goods_id);
    this.setData({
      goodsObj:{
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        /* 
          iPhone部分手机不能识别webp图片格式
          最好找到后台进行修改
          自己改：1.webp => 1.jpg
        */
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsObj.pics
      },
      isCollect
    })
  },
  /* 点击轮播图放大预览图 */
  handlePreviewImage(e) {
    const urls = this.Goodsinfo.pics.map(v => v.pics_mid);
    /* 接收传递过来的图片url */
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
      /* current: current,
      urls: urls */
    });
  },
  /* 加入购物车 */
  handleCartAdd() {
    /* 1.获取缓存中的购物车数组 */
    let cart = wx.getStorageSync("cart") || [];
    /* 2.判断商品对象是否存在于购物车数组中 */
    let index = cart.findIndex(v => v.goods_id === this.Goodsinfo.goods_id);
    if(index === -1) {
      /* 3.不存在  第一次添加 */
      this.Goodsinfo.num = 1;
      this.Goodsinfo.checked = true;
      cart.push(this.Goodsinfo);
    } else {
      /* 4.已经存在购物车数据 */
      cart[index].num++;
    }
    /* 5.把购物车重新添加回缓存中  */
    wx.setStorageSync("cart", cart);
    /* 6.弹窗提示 */
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      /* 防止疯狂点击 */
      mask: true
    });
  },
  /* 商品收藏 */
  handleCollect() {
    let isCollect = false;
    let collect = wx.getStorageSync("collect") || [];
    /* 该商品是否被收藏过 */
    let index = collect.findIndex(v => v.goods_id === this.Goodsinfo.goods_id);
    if(index !== -1) {
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    } else {
      collect.push(this.Goodsinfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    wx.setStorageSync("collect", collect);
    this.setData({
      isCollect
    })
  }
})