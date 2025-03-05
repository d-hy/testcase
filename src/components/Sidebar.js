import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FolderOutlined,
  PlayCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <Sider className="sidebar" width={250}>
      <div className="logo">
        <h1>测试平台</h1>
      </div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['testManagement', 'batchManagement']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item 
          key="/" 
          icon={<DashboardOutlined />}
          onClick={() => handleMenuClick('/')}
          style={{ marginTop: '8px', fontSize: '16px' }}
        >
          总体概览
        </Menu.Item>

        <SubMenu
          key="testManagement"
          icon={<FolderOutlined />}
          title="用例管理"
          style={{ marginTop: '8px' }}
        >
          <Menu.Item 
            key="/testcase/groups"
            onClick={() => handleMenuClick('/testcase/groups')}
          >
            用例分组
          </Menu.Item>
          <Menu.Item 
            key="/testcase/list"
            onClick={() => handleMenuClick('/testcase/list')}
          >
            用例列表
          </Menu.Item>
        </SubMenu>

        <SubMenu
          key="batchManagement"
          icon={<PlayCircleOutlined />}
          title="批次管理"
          style={{ marginTop: '8px' }}
        >
          <Menu.Item 
            key="/execution/create"
            onClick={() => handleMenuClick('/execution/create')}
          >
            创建批次
          </Menu.Item>
          <Menu.Item 
            key="/execution/history"
            onClick={() => handleMenuClick('/execution/history')}
          >
            执行历史
          </Menu.Item>
        </SubMenu>

        <Menu.Item
          key="/settings"
          icon={<SettingOutlined />}
          onClick={() => handleMenuClick('/settings')}
          style={{ marginTop: '8px', fontSize: '16px' }}
        >
          系统设置
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
