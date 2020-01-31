let ipUrl = 'http://172.245.162.166:7001/admin/'

let servicePath = {
  getTypeInfo: ipUrl + 'getTypeInfo',  //  获得文章类别信息
  checkLogin: ipUrl + 'checkLogin',  //  检查用户名密码是否正确
  addArticle:ipUrl + 'addArticle' ,  //  添加文章
  updateArticle:ipUrl + 'updateArticle' ,  //  修改文章第api地址
  getArticleList:ipUrl + 'getArticleList' ,  //  文章列表
  delArticle:ipUrl + 'delArticle/' ,  //  删除文章
  getArticleById:ipUrl + 'getArticleById/' ,  //  根据ID获得文章详情
}

export default servicePath;