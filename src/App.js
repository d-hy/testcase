import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CaseGroups from './pages/CaseGroups'
import TestCaseList from './pages/TestCaseList'
import TestCaseForm from './pages/TestCaseForm'
import CreateBatch from './pages/CreateBatch'
import BatchHistory from './pages/BatchHistory'
import BatchDetail from './pages/BatchDetail'
import Settings from './pages/Settings'

const { Content } = Layout

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
        <Sidebar />
        <Content
          style={{
            flex: 1,
            background: '#f5f5f5',
            padding: '0',
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard/overview" element={<Dashboard />} />
            <Route path="/testcase/groups" element={<CaseGroups />} />
            <Route path="/testcase/list" element={<TestCaseList />} />
            <Route path="/testcase/new" element={<TestCaseForm />} />
            <Route path="/testcase/edit/:id" element={<TestCaseForm />} />
            <Route path="/execution/create" element={<CreateBatch />} />
            <Route path="/execution/history" element={<BatchHistory />} />
            <Route path="/execution/detail/:id" element={<BatchDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  )
}

export default App

