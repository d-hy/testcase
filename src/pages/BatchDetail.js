import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, Progress, Row, Col, Statistic, Typography, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined, ClockCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const BatchDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState({
    id: '',
    name: '',
    cases: [],
    createdAt: '',
    updatedAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    locked: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    passRate: 0
  })

  useEffect(() => {
    const loadBatch = () => {
      try {
        const savedBatches = JSON.parse(localStorage.getItem('testBatches') || '[]')
        const currentBatch = savedBatches.find(b => String(b.id) === String(id))
        if (currentBatch) {
          const normalizedBatch = {
            ...currentBatch,
            cases: currentBatch.cases.map(testCase => ({
              ...testCase,
              steps: Array.isArray(testCase.steps) ? testCase.steps : []
            }))
          }
          setBatch(normalizedBatch)
          calculateStats(normalizedBatch.cases)
          setLoading(false)
        } else {
          console.error('Batch not found:', id)
          message.error('未找到该批次数据')
          navigate('/execution/history')
        }
      } catch (error) {
        console.error('Error loading batch:', error)
        message.error('加载批次数据失败')
        setLoading(false)
        navigate('/execution/history')
      }
    }

    loadBatch()
  }, [id, navigate])

  const calculateStats = cases => {
    const totalCases = cases.length
    const lockedCases = cases.filter(c => c.status === 'locked').length
    const passedCases = cases.filter(c => c.status === 'passed').length
    const failedCases = cases.filter(c => c.status === 'failed').length
    const pendingCases = cases.filter(c => !c.status || c.status === 'pending').length
    const availableTotal = totalCases - lockedCases

    setStats({
      total: totalCases,
      locked: lockedCases,
      passed: passedCases,
      failed: failedCases,
      pending: pendingCases,
      passRate: availableTotal > 0 ? Math.round((passedCases / availableTotal) * 100) : 0
    })
  }

  const handleStatusChange = (caseId, newStatus) => {
    try {
      const now = new Date().toISOString()
      // 更新当前批次中的用例状态
      const updatedCases = batch.cases.map(testCase =>
        testCase.id === caseId
          ? {
              ...testCase,
              status: newStatus,
              executedAt: now
            }
          : testCase
      )

      // 更新localStorage中的批次数据
      const savedBatches = JSON.parse(localStorage.getItem('testBatches') || '[]')
      const updatedBatches = savedBatches.map(b =>
        b.id === batch.id
          ? {
              ...b,
              cases: updatedCases,
              updatedAt: now
            }
          : b
      )
      localStorage.setItem('testBatches', JSON.stringify(updatedBatches))

      setBatch({ ...batch, cases: updatedCases })
      calculateStats(updatedCases)
      message.success('状态更新成功')
    } catch (error) {
      console.error('Error updating test case status:', error)
      message.error('状态更新失败')
    }
  }

  const renderSteps = text => {
    if (!text) return '-'
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
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <div style={{ fontWeight: 500, color: '#1890ff' }}>{text}</div>
    },
    {
      title: '前置条件',
      dataIndex: 'precondition',
      key: 'precondition',
      render: renderSteps
    },
    {
      title: '步骤',
      dataIndex: 'steps',
      key: 'steps',
      render: steps => {
        if (typeof steps === 'string') {
          return renderSteps(steps)
        }

        if (!Array.isArray(steps) || !steps.length) return '-'
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
                {typeof step === 'object' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>{step.action || step.description}</div>
                    {step.expected && (
                      <div style={{ color: '#666', marginTop: '4px', paddingLeft: '12px' }}>预期：{step.expected}</div>
                    )}
                  </div>
                ) : (
                  step
                )}
              </li>
            ))}
          </ol>
        )
      }
    },
    {
      title: '预期结果',
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      render: renderSteps
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = ''
        let text = ''
        let icon = null
        switch (status) {
          case 'passed':
            color = '#52c41a'
            text = '通过'
            icon = <CheckCircleOutlined />
            break
          case 'failed':
            color = '#ff4d4f'
            text = '失败'
            icon = <CloseCircleOutlined />
            break
          case 'locked':
            color = '#faad14'
            text = '锁定'
            icon = <LockOutlined />
            break
          default:
            color = '#8c8c8c'
            text = '待执行'
            icon = <ClockCircleOutlined />
        }
        return (
          <Space>
            {icon}
            <span style={{ color }}>{text}</span>
          </Space>
        )
      }
    },
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      key: 'executedAt',
      render: (time, record) => {
        const displayTime = time || record.updatedAt || record.createdAt
        if (!displayTime) return '-'
        return new Date(displayTime).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type={record.status === 'passed' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            size="small"
            onClick={() => handleStatusChange(record.id, 'passed')}
          >
            通过
          </Button>
          <Button
            type={record.status === 'failed' ? 'primary' : 'default'}
            danger
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => handleStatusChange(record.id, 'failed')}
          >
            失败
          </Button>
          <Button
            type={record.status === 'locked' ? 'primary' : 'default'}
            icon={<LockOutlined />}
            size="small"
            onClick={() => handleStatusChange(record.id, 'locked')}
          >
            锁定
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>
              批次详情
            </Title>
            <Text type="secondary">创建时间：{new Date(batch.createdAt).toLocaleString('zh-CN')}</Text>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={4}>
            <Card>
              <Statistic title="总用例数" value={stats.total} suffix="个" />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="通过数" value={stats.passed} valueStyle={{ color: '#52c41a' }} suffix="个" />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="失败数" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} suffix="个" />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="待执行数" value={stats.pending} valueStyle={{ color: '#8c8c8c' }} suffix="个" />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="锁定数" value={stats.locked} valueStyle={{ color: '#faad14' }} suffix="个" />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="通过率"
                value={stats.passRate}
                suffix="%"
                prefix={
                  <Progress
                    type="circle"
                    percent={stats.passRate}
                    width={20}
                    strokeWidth={10}
                    showInfo={false}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#52c41a'
                    }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        <Table
          style={{ marginTop: '16px' }}
          columns={columns}
          dataSource={batch.cases}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  )
}

export default BatchDetail
