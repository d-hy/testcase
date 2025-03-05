import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function ImportOpml({ onImport }) {
  const beforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
        const testCases = parseOpmlToTestCases(xmlDoc);
        onImport(testCases);
        message.success('成功导入测试用例');
      } catch (error) {
        message.error('OPML文件解析失败');
        console.error(error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const parseOpmlToTestCases = (xmlDoc) => {
    const testCases = [];
    const outlines = xmlDoc.querySelectorAll('body > outline > outline');
    
    outlines.forEach((outline) => {
      const testCase = {
        id: Date.now() + Math.random(),
        name: outline.getAttribute('text'),
        description: '',
        precondition: '',
        steps: '',
        expectedResult: '',
        priority: '',
        status: 'pending'
      };

      outline.querySelectorAll('outline').forEach((section) => {
        const sectionText = section.getAttribute('text').toLowerCase();
        // 将每个子节点作为单独的一行，并添加换行符
        const contentItems = Array.from(section.querySelectorAll('outline'))
          .map(item => item.getAttribute('text').replace(/^\d+\.\s*/, '').trim())
          .filter(text => text); // 过滤掉空字符串

        // 使用\n作为换行符连接内容
        const content = contentItems.join('\\n');

        switch(sectionText) {
          case '前置条件':
            testCase.precondition = content;
            break;
          case '操作步骤':
            testCase.steps = content;
            break;
          case '预期结果':
            testCase.expectedResult = content;
            break;
          case '优先级':
            testCase.priority = content.toLowerCase().includes('p1') ? 'high' : 
                              content.toLowerCase().includes('p2') ? 'medium' : 'low';
            break;
        }
      });

      testCases.push(testCase);
    });

    return testCases;
  };

  return (
    <Upload
      beforeUpload={beforeUpload}
      accept=".opml,.xml"
      showUploadList={false}
    >
      <Button icon={<UploadOutlined />}>导入OPML文件</Button>
    </Upload>
  );
}

export default ImportOpml;
