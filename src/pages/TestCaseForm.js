import React from 'react';
import { Form, Input, Button, Card, Select, Space, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const TestCaseForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName } = location.state || {};
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 添加分组信息和创建时间
      const newTestCase = {
        ...values,
        id: Date.now(),
        groupId,
        groupName,
        createdAt: new Date().toLocaleString(),
      };

      // 保存到 localStorage
      const savedTestCases = localStorage.getItem('testCases');
      const existingTestCases = savedTestCases ? JSON.parse(savedTestCases) : [];
      localStorage.setItem('testCases', JSON.stringify([...existingTestCases, newTestCase]));

      // 更新分组的用例计数
      const savedGroups = localStorage.getItem('testCaseGroups');
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        const updatedGroups = groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              caseCount: (group.caseCount || 0) + 1
            };
          }
          return group;
        });
        localStorage.setItem('testCaseGroups', JSON.stringify(updatedGroups));
      }

      message.success('测试用例创建成功');
      
      // 返回到用例列表页面，并传递分组信息
      navigate('/testcase/list', { 
        state: { groupId, groupName },
        replace: true 
      });
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    // 返回到用例列表页面，并传递分组信息
    navigate('/testcase/list', { 
      state: { groupId, groupName },
      replace: true 
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={groupName ? `新建测试用例 - ${groupName}` : '新建测试用例'}
        extra={
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium'
          }}
        >
          <Form.Item
            name="name"
            label="用例名称"
            rules={[{ required: true, message: '请输入用例名称' }]}
          >
            <Input placeholder="请输入用例名称" />
          </Form.Item>

          <Form.Item
            name="precondition"
            label="前置条件"
          >
            <TextArea
              placeholder="请输入前置条件，每行一个条件，例如：&#13;&#10;1. 系统已启动&#13;&#10;2. 用户已登录"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>

          <Form.Item
            name="steps"
            label="操作步骤"
            rules={[{ required: true, message: '请输入操作步骤' }]}
          >
            <TextArea
              placeholder="请输入操作步骤，每行一个步骤，例如：&#13;&#10;1. 点击新建按钮&#13;&#10;2. 输入必填信息&#13;&#10;3. 点击保存按钮"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>

          <Form.Item
            name="expectedResult"
            label="预期结果"
            rules={[{ required: true, message: '请输入预期结果' }]}
          >
            <TextArea
              placeholder="请输入预期结果，每行一个结果，例如：&#13;&#10;1. 提示保存成功&#13;&#10;2. 数据显示在列表中"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="high">高 (P1)</Option>
              <Option value="medium">中 (P2)</Option>
              <Option value="low">低 (P3)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="pending"
          >
            <Select>
              <Option value="pending">待执行</Option>
              <Option value="passed">通过</Option>
              <Option value="failed">失败</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TestCaseForm;
