import { 
  getSetting, 
  chooseAddress, 
  openSetting, 
  showModal,
  showToast } from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0
  },
  onShow() {
    /* 获取缓存中的收货地址信息 */
    const address = wx.getStorageSync("address");
    /* 获取缓存中的购物车数据 */
    const cart = wx.getStorageSync("cart") || [];
    
    this.setData({address});
    this.setCart(cart);
  },
  
  async handleChooseAddress() {
    try {
      /* //获取权限状态
      wx.getSetting({
        success: (result)=>{
          const scopeAddress = result.authSetting['scope.address']
          if(scopeAddress === true || scopeAddress === undefined) {
            wx.chooseAddress({
              success: (result1)=>{
                console.log(result1);
              }
            });
          } else {
            //用户以前拒绝过授予权限 ,先诱导用户打开授权页面
            wx.openSetting({
              success: (result2)=>{
                //可以调用获取收货地址
                wx.chooseAddress({
                  success: (result3)=>{
                    console.log(result3);
                  }
                });
              }
            });
          }
        },
        fail: ()=>{},
        complete: ()=>{}
      }); */
  
      /* 1.获取权限状态 */
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting['scope.address']
      /* 2.判断权限状态 */
      if(scopeAddress === false) {
        /* 3.先诱导用户打开授权页面 */
        await openSetting();
      }
      /* 4.调用获取收货地址api */
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      console.log(address)
      /* 5存入到缓存中 */
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error)
    }
  },
  /* 商品的选中 */
  handleItemChange(e) {
    /* 1.获取被修改的商品id */
    const goods_id = e.currentTarget.dataset.id;
    console.log(goods_id);
    /* 2.获取购物车数组 */
    let {cart} = this.data;
    /* 3.找到被修改的商品对象 */
    let index = cart.findIndex(v=>v.goods_id===goods_id);
    /* 4.选中状态取反 */
    cart[index].checked = !cart[index].checked;
    
    this.setCart(cart);
  },
  /* 设置购物车状态，重新计算底部工具栏的数据 全选 总价 购买数量 */
  setCart(cart) {
    let allChecked = true;
    /* 总价格 总数量 */
    let totalPrice=0;
    let totalNum=0;
    cart.forEach(v=>{
      if(v.checked) {
        totalPrice+=v.num*v.goods_price;
        totalNum+=v.num;
      } else {
        allChecked = false;
      }
    })
    /* 判断数组是否为空 */
    allChecked = cart.length != 0 ? allChecked : false;
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked
    });
    wx.setStorageSync("cart", cart);
  },
  /* 商品全选 */
  handleItemAllCheck() {
    /* 1.获取data中的数据 */
    let {cart, allChecked} = this.data;
    /* 2.修改值 */
    allChecked = !allChecked;
    /* 3.循环修改 cart 数组中的商品选中状态 */
    cart.forEach(v => v.checked = allChecked);
    /* 4.把修改后的值 填充回 data 或者缓存中 */
    this.setData(cart);
  },
  /* 商品数量编辑 */
  async handleItemNumEdit(e) {
    /* 1.获取传过来的参数 */
    const {operation, id} = e.currentTarget.dataset;
    /* 2.获取购物车数组 */
    let {cart} = this.data;
    /* 3.找到需要修改的索引 */
    const index = cart.findIndex(v => v.goods_id === id);
    /* 4.判断是否要执行删除 */
    if(cart[index].num === 1 && operation === -1) {
      /* 弹框提示 */
      const res = await showModal({content: '确认删除?'});
      if(res.confirm) {
        cart.splice(index, 1);
        this.setCart(cart);
      }
    } else {
      /* 4.修改数量 */
      cart[index].num += operation;
      /* 5.设置回缓存和data中 */
      this.setCart(cart);
    }
  },
  /* 结算 */
  async handlePay() {
    /* 1.判断收货地址 */
    const { address, totalNum } = this.data;
    if(!address.userName) {
      await showToast({title: '您还没有选择收货地址'});
      return;
    }
    /* 2.判断用户有没有选购商品 */
    if(totalNum === 0) {
      await showToast({title: '您还没有选购商品'});
      return;
    }
    /* 3.跳转到支付页面 */
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})