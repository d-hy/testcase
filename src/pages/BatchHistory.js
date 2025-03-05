import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Progress, Button, Space, Popconfirm } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { message } from 'antd'

const BatchHistory = () => {
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])

  useEffect(() => {
    // 从localStorage加载批次数据
    const savedBatches = localStorage.getItem('testBatches')
    if (savedBatches) {
      try {
        const parsedBatches = JSON.parse(savedBatches)
        // 确保每个测试用例都有steps数组
        const normalizedBatches = parsedBatches.map(batch => ({
          ...batch,
          cases: batch.cases.map(testCase => ({
            ...testCase,
            steps: Array.isArray(testCase.steps) ? testCase.steps : []
          }))
        }))
        console.log('Loaded batches:', normalizedBatches)
        setBatches(normalizedBatches)
      } catch (error) {
        console.error('Error parsing batches:', error)
        message.error('加载批次数据失败')
      }
    }
  }, [])

  const calculateStats = cases => {
    const totalCases = cases.length
    const lockedCases = cases.filter(c => c.status === 'locked').length
    const passedCases = cases.filter(c => c.status === 'passed').length
    const failedCases = cases.filter(c => c.status === 'failed').length
    const availableTotal = totalCases - lockedCases

    return {
      total: totalCases,
      locked: lockedCases,
      passed: passedCases,
      failed: failedCases,
      available: availableTotal,
      passRate: availableTotal > 0 ? Math.round((passedCases / availableTotal) * 100) : 0
    }
  }

  const handleDelete = batchId => {
    try {
      // 从 localStorage 中获取最新的批次数据
      const savedBatches = JSON.parse(localStorage.getItem('testBatches') || '[]')
      // 过滤掉要删除的批次
      const updatedBatches = savedBatches.filter(batch => batch.id !== batchId)
      // 保存更新后的数据
      localStorage.setItem('testBatches', JSON.stringify(updatedBatches))
      // 更新状态
      setBatches(updatedBatches)
      message.success('删除成功')
    } catch (error) {
      console.error('Error deleting batch:', error)
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '批次名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <div style={{ fontWeight: 500, color: '#1890ff' }}>{text}</div>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: time =>
        new Date(time).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
    },
    {
      title: '用例数量',
      dataIndex: 'cases',
      key: 'caseCount',
      render: cases => cases.length
    },
    {
      title: '通过率',
      key: 'passRate',
      render: (_, record) => {
        const stats = calculateStats(record.cases)

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Progress
              percent={stats.passRate}
              size="small"
              style={{ width: 100, marginRight: 8 }}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#52c41a'
              }}
            />
            <span>{stats.passRate}%</span>
          </div>
        )
      }
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        // 检查所有用例的状态
        const totalCases = record.cases.length
        const markedCases = record.cases.filter(
          c => c.status === 'passed' || c.status === 'failed' || c.status === 'locked'
        ).length

        let status = 'NOT_STARTED' // 默认未开始

        if (markedCases === totalCases) {
          status = 'COMPLETED' // 所有用例都已标记状态
        } else if (markedCases > 0) {
          status = 'RUNNING' // 部分用例已标记状态
        }

        const statusConfig = {
          COMPLETED: { color: '#52c41a', text: '已完成' },
          RUNNING: { color: '#1890ff', text: '执行中' },
          NOT_STARTED: { color: '#8c8c8c', text: '未开始' }
        }

        return <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/execution/detail/${record.id}`}>查看详情</Link>
          <Popconfirm
            title="确定要删除这个批次吗？"
            description="删除后无法恢复，请谨慎操作"
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

  return (
    <div style={{ padding: '24px' }}>
      <Card title="批次执行历史">
        <Table
          columns={columns}
          dataSource={batches}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default BatchHistory

