import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Row,
  Col,
  Typography,
  Tooltip,
  Card,
  Popconfirm,
  message,
  Modal,
  Form
} from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const { Title } = Typography

function TestCaseList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { groupId, groupName } = location.state || {}
  const [searchText, setSearchText] = useState('')
  const [testCases, setTestCases] = useState(() => {
    const savedTestCases = localStorage.getItem('testCases')
    return savedTestCases
      ? JSON.parse(savedTestCases)
      : [
          {
            id: 1,
            name: '登录功能测试',
            priority: 'high',
            status: 'pending',
            createdAt: '2025-03-04 10:00:00',
            precondition: '用户已注册\\n用户已登录',
            steps: '输入用户名和密码\\n点击登录按钮',
            expectedResult: '登录成功\\n跳转到首页'
          },
          {
            id: 2,
            name: '注册功能测试',
            priority: 'medium',
            status: 'pending',
            createdAt: '2025-03-04 11:00:00',
            precondition: '用户未注册',
            steps: '输入用户名和密码\\n点击注册按钮',
            expectedResult: '注册成功\\n跳转到登录页面'
          }
        ]
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 根据分组ID过滤测试用例
  const filteredTestCases = testCases.filter(
    testCase =>
      (!groupId || testCase.groupId === groupId) &&
      (testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
        testCase.precondition?.toLowerCase().includes(searchText.toLowerCase()) ||
        testCase.steps?.toLowerCase().includes(searchText.toLowerCase()) ||
        testCase.expectedResult?.toLowerCase().includes(searchText.toLowerCase()))
  )

  useEffect(() => {
    localStorage.setItem('testCases', JSON.stringify(testCases))
  }, [testCases])

  const handleEdit = id => {
    navigate(`/testcase/edit/${id}`)
  }

  const handleDelete = id => {
    setTestCases(prevTestCases => prevTestCases.filter(testCase => testCase.id !== id))
  }

  const renderSteps = text => {
    if (!text) return null
    const steps = text.split('\\n')
    return (
      <ol
        style={{
          margin: 0,
          paddingLeft: 24,
          listStyle: 'decimal'
        }}
      >
        {steps.map((step, index) => (
          <li
            key={index}
            style={{
              lineHeight: '1.5',
              marginBottom: '8px',
              color: '#333'
            }}
          >
            {step.replace(/^\d+\.\s*/, '')}
          </li>
        ))}
      </ol>
    )
  }

  // 修改创建批次的处理函数
  const handleCreateBatch = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择至少一条用例')
      return
    }
    setIsModalVisible(true)
  }

  // 修改确认创建批次的处理函数
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      // 获取选中的用例
      const selectedCases = testCases.filter(testCase => selectedRowKeys.includes(testCase.id))

      // 创建新批次，处理步骤数据
      const newBatch = {
        id: Date.now(),
        name: values.batchName,
        createdAt: new Date().toISOString(),
        cases: selectedCases.map(testCase => {
          // 如果steps是字符串，转换为数组格式
          const stepsArray = testCase.steps
            ? testCase.steps.split('\\n').map(step => ({
                action: step.replace(/^\d+\.\s*/, ''),
                description: step.replace(/^\d+\.\s*/, '')
              }))
            : []

          return {
            ...testCase,
            steps: stepsArray,
            status: 'pending' // 重置状态为待执行
          }
        })
      }

      // 保存到 localStorage
      const savedBatches = localStorage.getItem('testBatches')
      const batches = savedBatches ? JSON.parse(savedBatches) : []
      localStorage.setItem('testBatches', JSON.stringify([...batches, newBatch]))

      message.success('批次创建成功')
      setSelectedRowKeys([])
      form.resetFields()
      setIsModalVisible(false)
      navigate(`/execution/detail/${newBatch.id}`)
    } catch (error) {
      console.error('Error creating batch:', error)
      message.error('创建批次失败')
    }
  }

  // 添加取消创建的处理函数
  const handleModalCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  // 修改列定义，移除状态列
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1
    },
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: text => (
        <div
          style={{
            fontWeight: 500,
            color: '#1890ff'
          }}
        >
          {text}
        </div>
      )
    },
    {
      title: '前置条件',
      dataIndex: 'precondition',
      key: 'precondition',
      width: 250,
      render: renderSteps
    },
    {
      title: '操作步骤',
      dataIndex: 'steps',
      key: 'steps',
      width: 300,
      render: renderSteps
    },
    {
      title: '预期结果',
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      width: 250,
      render: renderSteps
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: priority => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green'
        const label = priority === 'high' ? 'P1' : priority === 'medium' ? 'P2' : 'P3'
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条用例吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys)
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {groupName ? `${groupName} - 用例列表` : '所有用例'}
            </Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="搜索用例"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={() => navigate('/testcase/new', { state: { groupId, groupName } })}>
                新建用例
              </Button>
              <Button type="primary" onClick={handleCreateBatch} disabled={selectedRowKeys.length === 0}>
                创建批次({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredTestCases}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`
          }}
          rowSelection={rowSelection}
        />

        {/* 添加创建批次的弹框 */}
        <Modal
          title="创建执行批次"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="确定"
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="batchName"
              label="批次名称"
              rules={[
                { required: true, message: '请输入批次名称' },
                { max: 50, message: '批次名称不能超过50个字符' }
              ]}
            >
              <Input placeholder="请输入批次名称" defaultValue={`批次-${new Date().toLocaleString()}`} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default TestCaseList
