import React from 'react';
import { Card, Form, Input, Switch, Button, Space, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // 保存设置到 localStorage
    localStorage.setItem('appSettings', JSON.stringify(values));
    message.success('设置已保存');
  };

  // 从 localStorage 加载设置
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      form.setFieldsValue(JSON.parse(savedSettings));
    }
  }, [form]);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            autoSave: true,
            batchSize: 20,
            defaultGroup: '默认分组'
          }}
        >
          <Form.Item
            label="默认分组名称"
            name="defaultGroup"
            rules={[{ required: true, message: '请输入默认分组名称' }]}
          >
            <Input placeholder="请输入默认分组名称" />
          </Form.Item>

          <Form.Item
            label="每页显示数量"
            name="batchSize"
            rules={[{ required: true, message: '请输入每页显示数量' }]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>

          <Form.Item
            label="自动保存"
            name="autoSave"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存设置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
