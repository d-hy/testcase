import React, { useState, useEffect } from 'react'
import { Card, Form, Select, Table, Button, Input, message, Tag, Space } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'

const { Option } = Select

const CreateBatch = () => {
  const [form] = Form.useForm()
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedCases, setSelectedCases] = useState([])
  const [groups, setGroups] = useState([])
  const [testCases, setTestCases] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 从localStorage加载分组数据
    const savedGroups = localStorage.getItem('testCaseGroups')
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  useEffect(() => {
    // 从localStorage加载测试用例数据
    const savedTestCases = localStorage.getItem('testCases')
    if (savedTestCases) {
      setTestCases(JSON.parse(savedTestCases))
    }
  }, [])

  useEffect(() => {
    // 从localStorage加载批次数据
    const savedBatches = localStorage.getItem('testBatches')
    if (savedBatches) {
      setBatches(JSON.parse(savedBatches))
    }
  }, [])

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

  const columns = [
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: text => <div style={{ fontWeight: 500, color: '#1890ff' }}>{text}</div>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => {
        let color = ''
        let text = ''
        switch (status) {
          case 'passed':
            color = 'success'
            text = '通过'
            break
          case 'failed':
            color = 'error'
            text = '失败'
            break
          case 'locked':
            color = 'warning'
            text = '锁定'
            break
          default:
            color = 'default'
            text = '待执行'
        }
        return <Tag color={color}>{text}</Tag>
      }
    }
  ]

  const handleGroupChange = value => {
    setSelectedGroup(value)
    // 根据选中的分组筛选测试用例
    const groupCases = testCases.filter(testCase => testCase.groupId === value)
    setSelectedCases(groupCases)
  }

  const getNextBatchId = () => {
    const savedBatches = JSON.parse(localStorage.getItem('testBatches') || '[]')
    const maxId = Math.max(...savedBatches.map(b => b.id), 0)
    return maxId + 1
  }

  const handleCreateBatch = async values => {
    try {
      if (selectedCases.length === 0) {
        message.warning('请选择要执行的测试用例')
        return
      }

      setLoading(true)

      const newBatch = {
        id: getNextBatchId(),
        name: values.batchName,
        groupId: selectedGroup,
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
            status: 'pending'
          }
        }),
        status: 'pending',
        createdAt: new Date().toLocaleString()
      }

      const updatedBatches = [...batches, newBatch]
      localStorage.setItem('testBatches', JSON.stringify(updatedBatches))
      setBatches(updatedBatches)
      message.success('批次创建成功')
      setLoading(false)
      form.resetFields()
      setSelectedGroup(null)
      setSelectedCases([])
    } catch (error) {
      console.error('Create batch failed:', error)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <span>
            <PlayCircleOutlined /> 创建执行批次
          </span>
        }
      >
        <Form form={form} onFinish={handleCreateBatch} layout="vertical">
          <Form.Item name="groupId" label="选择用例分组" rules={[{ required: true, message: '请选择用例分组' }]}>
            <Select placeholder="请选择用例分组" onChange={handleGroupChange} value={selectedGroup}>
              {groups.map(group => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedGroup && (
            <>
              <Form.Item label="批次名称" name="batchName" rules={[{ required: true, message: '请输入批次名称' }]}>
                <Input placeholder="例如：回归测试2023Q4" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  创建批次
                </Button>
              </Form.Item>

              <Table columns={columns} dataSource={selectedCases} rowKey="id" scroll={{ x: 1500 }} pagination={false} />
            </>
          )}
        </Form>
      </Card>
    </div>
  )
}

export default CreateBatch

