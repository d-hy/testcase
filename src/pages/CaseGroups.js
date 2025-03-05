import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Space, message, Drawer } from 'antd'
import { PlusOutlined, FolderOutlined, ImportOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ImportOpml from '../components/ImportOpml'

const CaseGroups = () => {
  const navigate = useNavigate()
  const [groups, setGroups] = useState(() => {
    const savedGroups = localStorage.getItem('testCaseGroups')
    return savedGroups ? JSON.parse(savedGroups) : []
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isImportDrawerVisible, setIsImportDrawerVisible] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    localStorage.setItem('testCaseGroups', JSON.stringify(groups))
  }, [groups])

  const columns = [
    {
      title: '分组名称',
      dataIndex: 'name',
      key: 'name',
      render: text => (
        <Space>
          <FolderOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '用例数量',
      dataIndex: 'caseCount',
      key: 'caseCount',
      render: text => text || 0
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleAddTestCase(record)}>
            新增用例
          </Button>
          <Button type="link" onClick={() => handleImportTestCase(record)}>
            导入用例
          </Button>
          <Button type="link" onClick={() => handleViewGroup(record)}>
            查看用例
          </Button>
          <Button type="link" danger onClick={() => handleDeleteGroup(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleAddGroup = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const newGroup = {
        id: Date.now(),
        ...values,
        createdAt: new Date().toLocaleString(),
        caseCount: 0
      }
      setGroups([...groups, newGroup])
      message.success('分组创建成功')
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Validate Failed:', error)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleAddTestCase = group => {
    // 导航到新建用例页面，并传递分组信息
    navigate('/testcase/new', { state: { groupId: group.id, groupName: group.name } })
  }

  const handleImportTestCase = group => {
    setSelectedGroup(group)
    setIsImportDrawerVisible(true)
  }

  const handleViewGroup = group => {
    // 导航到用例列表页面，并传递分组ID作为过滤条件
    navigate('/testcase/list', { state: { groupId: group.id, groupName: group.name } })
  }

  const handleDeleteGroup = groupId => {
    try {
      // 1. 删除用例组
      const updatedGroups = groups.filter(group => group.id !== groupId)
      localStorage.setItem('testCaseGroups', JSON.stringify(updatedGroups))
      setGroups(updatedGroups)

      // 2. 删除关联的测试用例
      const savedCases = localStorage.getItem('testCases')
      if (savedCases) {
        const cases = JSON.parse(savedCases)
        const updatedCases = cases.filter(testCase => testCase.groupId !== groupId)
        localStorage.setItem('testCases', JSON.stringify(updatedCases))
      }

      message.success('删除成功')
    } catch (error) {
      console.error('Error deleting group:', error)
      message.error('删除失败')
    }
  }

  const handleImport = importedTestCases => {
    // 更新用例计数
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          caseCount: (group.caseCount || 0) + importedTestCases.length
        }
      }
      return group
    })
    setGroups(updatedGroups)

    // 将导入的用例添加到 localStorage
    const savedTestCases = localStorage.getItem('testCases')
    const existingTestCases = savedTestCases ? JSON.parse(savedTestCases) : []

    // 为导入的用例添加分组信息
    const testCasesWithGroup = importedTestCases.map(testCase => ({
      ...testCase,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name
    }))

    localStorage.setItem('testCases', JSON.stringify([...existingTestCases, ...testCasesWithGroup]))

    message.success('用例导入成功')
    setIsImportDrawerVisible(false)
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="用例分组管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
            新建分组
          </Button>
        }
      >
        <Table columns={columns} dataSource={groups} rowKey="id" />
      </Card>

      <Modal title="新建分组" open={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分组名称" rules={[{ required: true, message: '请输入分组名称' }]}>
            <Input placeholder="请输入分组名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入分组描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`导入用例到 ${selectedGroup?.name || ''}`}
        placement="right"
        width={600}
        onClose={() => setIsImportDrawerVisible(false)}
        open={isImportDrawerVisible}
      >
        <ImportOpml onImport={handleImport} />
      </Drawer>
    </div>
  )
}

export default CaseGroups

