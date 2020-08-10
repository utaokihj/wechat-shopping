import {request} from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
/**
   * 页面的初始数据
   */
  data: {
    leftMenuList: [],
    rightContent: [],
    currentIndex: 0,
    /* 右侧内容滚动条距离顶部的距离 */
    scrollTop:0
  },
  //接口返回数据
  Cates: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /* 1.先判断本地存储中是否有旧数据,有且未过期就使用，没有就发请求 */
    const Cates = wx.getStorageSync("cates");
    if(!Cates) {
      this.getCates();
    } else {
      /* 有旧数据，定义过期时间*/
      if(Date.now() - Cates.time > 1000 * 60 * 5) {
        this.getCates();
      } else {
        /* 可以使用旧数据 */
        this.Cates=Cates.data;
        let leftMenuList = this.Cates.map(v => v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  /* 获取分类页面数据 */
  async getCates() {
    /* request({
      url: '/categories'
    })
    .then(res => {
      console.log(res)
      // 左侧菜单 
      this.Cates = res;

      // 把接口数据存入到本地存储中
      wx.setStorageSync("cates", {time:Date.now(), data:this.Cates});

      let leftMenuList = this.Cates.map(v => v.cat_name);
      let rightContent = this.Cates[0].children;

      this.setData({
        leftMenuList,
        rightContent
      })
    }) */

    //使用es7的async await来发送请求
    const res=await request({url:'/categories'});
    // 左侧菜单 
    this.Cates = res;

    // 把接口数据存入到本地存储中
    wx.setStorageSync("cates", {time:Date.now(), data:this.Cates});

    let leftMenuList = this.Cates.map(v => v.cat_name);
    let rightContent = this.Cates[0].children;

    this.setData({
      leftMenuList,
      rightContent
    })
  },

  /* 左侧菜单点击事件 */
  handleItemTap(e) {
    console.log(e)
    /* 1.获取被点击标题索引值
       2.给data中的currentIndex赋值
       3.根据不同索引渲染右侧内容 */
    const {index} = e.currentTarget.dataset
    let rightContent = this.Cates[index].children;

    this.setData({
      currentIndex:index,
      rightContent,
      /* 重新设置右侧内容的scroll-view标签距离顶部的距离 */
      scrollTop:0
    })
  }
})