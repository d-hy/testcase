import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Space, Select, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    locked: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTestCases, setRecentTestCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedBatch]);

  const loadData = () => {
    try {
      const savedBatches = JSON.parse(localStorage.getItem('testBatches') || '[]');
      setBatches(savedBatches);

      // 根据选择的批次计算统计数据
      let targetCases = [];
      if (selectedBatch === 'all') {
        targetCases = savedBatches.flatMap(batch => batch.cases);
      } else {
        const selectedBatchData = savedBatches.find(b => b.id === selectedBatch);
        if (selectedBatchData) {
          targetCases = selectedBatchData.cases;
        }
      }

      // 计算统计数据
      const stats = {
        total: targetCases.length,
        passed: targetCases.filter(c => c.status === 'passed').length,
        failed: targetCases.filter(c => c.status === 'failed').length,
        locked: targetCases.filter(c => c.status === 'locked').length,
        pending: targetCases.filter(c => c.status === 'pending' || !c.status).length
      };
      setStats(stats);

      // 获取最近执行的用例（排除锁定状态的用例）
      const recentCases = targetCases
        .filter(c => c.status && c.status !== 'pending' && c.status !== 'locked')
        .sort((a, b) => {
          const timeA = a.executedAt || a.updatedAt || a.createdAt;
          const timeB = b.executedAt || b.updatedAt || b.createdAt;
          return new Date(timeB) - new Date(timeA);
        })
        .slice(0, 5);
      setRecentTestCases(recentCases);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (caseId, newStatus) => {
    try {
      const now = new Date().toLocaleString();
      const updatedCases = selectedCases.map(testCase =>
        testCase.id === caseId ? { 
          ...testCase, 
          status: newStatus,
          executedAt: now 
        } : testCase
      );

      // 更新localStorage中的用例数据
      const savedTestCases = JSON.parse(localStorage.getItem('testCases') || '[]');
      const updatedTestCases = savedTestCases.map(testCase =>
        testCase.id === caseId ? { 
          ...testCase, 
          status: newStatus,
          executedAt: now 
        } : testCase
      );
      localStorage.setItem('testCases', JSON.stringify(updatedTestCases));

      setSelectedCases(updatedCases);
      loadData(); // 重新加载数据以更新统计
    } catch (error) {
      console.error('Error updating test case status:', error);
    }
  };

  const columns = [
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        let icon = null;
        switch (status) {
          case 'passed':
            color = 'success';
            text = '通过';
            icon = <CheckCircleOutlined />;
            break;
          case 'failed':
            color = 'error';
            text = '失败';
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = 'default';
            text = '待执行';
            icon = <ClockCircleOutlined />;
        }
        return (
          <Space>
            {icon}
            <span style={{ color: status === 'passed' ? '#52c41a' : 
                                status === 'failed' ? '#ff4d4f' : '#8c8c8c' }}>
              {text}
            </span>
          </Space>
        );
      }
    },
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      key: 'executedAt',
      render: (time, record) => {
        const displayTime = time || record.updatedAt || record.createdAt;
        if (!displayTime) return '-';
        const date = new Date(displayTime);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={4} style={{ margin: 0 }}>测试执行概览</Title>
        </Col>
        <Col>
          <Select
            value={selectedBatch}
            onChange={setSelectedBatch}
            style={{ width: 200 }}
            loading={loading}
          >
            <Option value="all">所有批次</Option>
            {batches.map(batch => (
              <Option key={batch.id} value={batch.id}>
                {batch.name || `批次#${batch.id}`}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用例数"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="通过数"
              value={stats.passed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败数"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待执行"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="通过率">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Progress
                type="circle"
                percent={(() => {
                  const availableTotal = stats.total - stats.locked;
                  return availableTotal > 0 ? Math.round((stats.passed / availableTotal) * 100) : 0;
                })()}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
                success={{
                  percent: (() => {
                    const availableTotal = stats.total - stats.locked;
                    return availableTotal > 0 ? Math.round((stats.passed / availableTotal) * 100) : 0;
                  })()
                }}
              />
              <div style={{ marginTop: '16px' }}>
                <Space size="large">
                  <Space>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#52c41a', 
                      borderRadius: '50%' 
                    }} />
                    <span>通过 ({stats.passed})</span>
                  </Space>
                  <Space>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#ff4d4f', 
                      borderRadius: '50%' 
                    }} />
                    <span>失败 ({stats.failed})</span>
                  </Space>
                </Space>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  * 通过率 = 通过数 / (总用例数 - 锁定用例数)
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#8c8c8c' }}>
                  * 当前可执行用例：{stats.total - stats.locked}个
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近执行">
            <Table
              dataSource={recentTestCases}
              columns={columns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
