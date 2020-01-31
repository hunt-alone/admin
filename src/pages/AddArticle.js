import React, { useState, useEffect } from 'react';
import marked from 'marked';
import { Row, Col, Input, Select, Button, DatePicker, message } from 'antd';
import servicePath from '../config/apiUrl'
import axios from 'axios'
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.css'
import '../static/AddArticle.css';

const { Option } = Select;
const { TextArea } = Input;


const AddArticle = (props) => {
  useEffect(() => {
    getTypeInfo();
    let tmpId = props.match.params.id
    if (tmpId) {
      if (tmpId !== articleId) {
        setArticleId(tmpId)
        getArticleById(tmpId)
      }
    }
  }, [])
  const [articleId, setArticleId] = useState(0);  // 文章的ID，如果是0说明是新增加，如果不是0，说明是修改
  const [articleTitle, setArticleTitle] = useState('');  //文章标题
  const [articleContent, setArticleContent] = useState('');  //markdown的编辑内容
  const [markdownContent, setMarkdownContent] = useState('预览内容'); //html内容
  const [introducemd, setIntroducemd] = useState();            //简介的markdown内容
  const [introducehtml, setIntroducehtml] = useState('简介等待编辑'); //简介的html内容
  const [showDate, setShowDate] = useState();   //发布日期
  //const [updateDate, setUpdateDate] = useState(); //修改日志的日期
  const [typeInfo, setTypeInfo] = useState([]); // 文章类别信息
  const [selectedType, setSelectType] = useState('---请选择文章类型---'); //选择的文章类别

  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    }
  });

  const changeContent = (e) => {
    setArticleContent(e.target.value)
    let html = marked(e.target.value)
    setMarkdownContent(html)
  }

  const changeIntroduce = (e) => {
    setIntroducemd(e.target.value)
    let html = marked(e.target.value)
    setIntroducehtml(html)
  }
  //从中台得到文章类别信息
  const getTypeInfo = () => {
    axios({
      method: 'get',
      url: servicePath.getTypeInfo,
      header: { 'Access-Control-Allow-Origin': '*' }
    }, {
      withCredentials: true
    }).then(
      res => {
        if (res.data.data === "没有登录") {
          localStorage.removeItem('openId')
          props.history.push('/')
        } else {
          console.log(res.data.data)
          setTypeInfo(res.data.data)
        }

      }
    )
  }
  const getArticleById = (id) => {
    axios(servicePath.getArticleById + id, {
      header: { 'Access-Control-Allow-Origin': '*' }
    }, {
      withCredentials: true
    }).then(
      res => {
        if (res.data.data === "没有登录") {
          localStorage.removeItem('openId')
          props.history.push('/')
        } else {
          //let articleInfo= res.data.data[0]
          setArticleTitle(res.data.data[0].title)
          setArticleContent(res.data.data[0].article_content)
          let html = marked(res.data.data[0].article_content)
          setMarkdownContent(html)
          setIntroducemd(res.data.data[0].introduce)
          let tmpInt = marked(res.data.data[0].introduce)
          setIntroducehtml(tmpInt)
          setShowDate(res.data.data[0].addTime)
          setSelectType(res.data.data[0].typeId)
        }
      }
    )
  }
  //选择类别后的便哈
  const selectTypeHandler = (value) => {
    console.log(value)
    setSelectType(value)
  }
  const saveArticle = () => {
    if (!articleTitle) {
      message.error('文章标题不能为空！');
      return false;
    } else if (selectedType === '---请选择文章类型---') {
      message.error('必须选择文章类型！');
      return false;
    } else if (!articleContent) {
      message.error('文章内容不能为空！');
      return false;
    } else if (!introducemd) {
      message.error('文章简介不能为空！');
      return false;
    } else if (!showDate) {
      message.error('文章发布日期不能为空！');
      return false;
    }
    let dataProps = {}   //传递到接口的参数
    dataProps.type_id = selectedType
    dataProps.title = articleTitle
    dataProps.article_content = articleContent
    dataProps.introduce = introducemd
    let datetext = showDate.replace('-', '/') //把字符串转换成时间戳
    dataProps.addTime = (new Date(datetext).getTime()) / 1000


    if (articleId === 0) {
      console.log('articleId=' + articleId)
      dataProps.view_count = Math.ceil(Math.random() * 100) + 1000
      axios({
        method: 'post',
        url: servicePath.addArticle,
        data: dataProps
      }, {
        withCredentials: true
      }).then(
        res => {
          if (res.data.data === "没有登录") {
            localStorage.removeItem('openId')
            props.history.push('/')
          } else {
            setArticleId(res.data.insertId)
            if (res.data.isScuccess) {
              message.success('文章添加成功')
            } else {
              message.error('文章添加失败');
            }
          }
        }
      )
    } else {
      dataProps.id = articleId
      axios({
        method: 'post',
        url: servicePath.updateArticle,
        header: { 'Access-Control-Allow-Origin': '*' },
        data: dataProps
      }, {
        withCredentials: true
      }).then(
        res => {
          if (res.data.data === "没有登录") {
            localStorage.removeItem('openId')
            props.history.push('/')
          } else {
            if (res.data.isScuccess) {
              message.success('文章保存成功')
            } else {
              message.error('保存失败');
            }
          }
        }
      )
    }
  }
  return (
    <div className="addArt">
      <Row gutter={5}>
        <Col span={18}>
          <Row gutter={10} >
            <Col span={18}>
              <Input
                value={articleTitle}
                onChange={e => setArticleTitle(e.target.value)}
                placeholder="博客标题"
                size="large" />
            </Col>
            <Col span={6}>
              &nbsp;
              <Select defaultValue={selectedType} size="large" onChange={selectTypeHandler}>
                {
                  typeInfo.map( item => {
                    return <Option key={item.id} value={item.id}>{item.typeName}</Option>
                  })
                }
              </Select>
            </Col>
          </Row>
          <br />
          <Row gutter={10} >
            <Col span={12}>
              <TextArea
                value={articleContent}
                className="markdown-content"
                rows={35}
                onChange={changeContent}
                onPressEnter={changeContent}
                placeholder="文章内容"
              />
            </Col>
            <Col span={12}>
              <div
                className="show-html"
                dangerouslySetInnerHTML={{ __html: markdownContent }} >
              </div>
            </Col>
          </Row>

        </Col>

        <Col span={6}>
          <Row>
            <Col span={24}>
              <Button size="large">暂存文章</Button>&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="large" onClick={saveArticle}>发布文章</Button>
              <br />
            </Col>
            <Col span={24}>
              <br />
              <TextArea
                rows={4}
                value={introducemd}
                className="markdown-content"
                onChange={changeIntroduce}
                onPressEnter={changeIntroduce}
                placeholder="文章简介"
              />
              <br /><br />
              <div className="introduce-html"
                dangerouslySetInnerHTML={{ __html: introducehtml }} >

              </div>
            </Col>
            <Col span={12}>
              <div className="date-select">
                <DatePicker
                  placeholder="发布日期"
                  size="large"
                  showTime
                  onChange={(date, dateString) => {
                    setShowDate(dateString)
                  }}
                />
              </div>
            </Col>
          </Row>

        </Col>
      </Row>
    </div>
  )
}
export default AddArticle