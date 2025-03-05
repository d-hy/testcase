import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography, Box, Button } from '@mui/material'

const ExecutionHistoryDialog = ({ open, onClose, record }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>执行历史详情</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* 用例名称 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              用例名称：
            </Typography>
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body1">{record?.caseName || record?.name}</Typography>
            </Box>
          </Grid>

          {/* 前置条件 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              前置条件：
            </Typography>
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body1">{record?.precondition || '已登录系统，进入运营报表页面'}</Typography>
            </Box>
          </Grid>

          {/* 操作步骤 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              操作步骤：
            </Typography>
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body1">{record?.step || '-'}</Typography>
            </Box>
          </Grid>

          {/* 预期结果 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              预期结果：
            </Typography>
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {record?.expectedResult}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExecutionHistoryDialog
