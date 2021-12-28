import { Grid, Divider, Typography, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Box } from '@mui/system';
import React, { Fragment, useEffect, useRef } from 'react';
import { IPrescription } from './../prescription';
import { format } from 'date-fns';
import './index.css';

interface IPrintVersionProps {
  data: IPrescription
  onRef: (ref: HTMLDivElement) => void
}
function PrintVersion({ data, onRef }: IPrintVersionProps) {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => onRef(ref.current), []);
  return (
    <Box ref={ref} className="wrapper">
      <Box sx={{ textAlign: 'center', marginBottom: 1 }}>
        <Typography variant="h6">荣县佛都医院处方签</Typography>
      </Box>
      <Grid container spacing={4} sx={{ flex: 0 }}>
        <Grid item xs={5} style={{ whiteSpace: 'nowrap' }}>病历号（门诊口/住院口）：{data.presNo}</Grid>
        <Grid item xs={2} />
        <Grid item xs={5} alignItems="center" justifyContent="flex-end">
        开具日期：{format(data.issueDate, 'yyyy-MM-dd')}
        </Grid>
      </Grid>
      <Divider orientation="horizontal" className="divider" />
      <div className="patient-infos" aria-details="patient infos" style={{ flex: 0 }}>
        <Grid container spacing={4} className="dense-grid">
          <Grid item xs={4}>姓名：{data.patientName}</Grid>
          <Grid item xs={4}>性别：{data.patientGender}</Grid>
          <Grid item xs={4}>年龄：{data.patientAge}</Grid>
          <Grid item xs={6}>住址/电话：{data.patientAddr}</Grid>
          <Grid item xs={6}>科别：{data.departmentName}</Grid>
          <Grid item xs={12}>
            <FormGroup className="check-group">
              <span>费别：</span>
              <FormControlLabel control={<Checkbox disabled checked={data.chargeType === '自费'} />} label="自费" />
              <FormControlLabel control={<Checkbox disabled checked={data.chargeType === '新农合'} />} label="新农合" />
              <FormControlLabel control={<Checkbox disabled checked={data.chargeType === '医保'} />} label="医保" />
              <FormControlLabel control={<Checkbox disabled checked={data.chargeType === '保健对象'} />} label="保健对象" />
              <FormControlLabel control={<Checkbox disabled checked={data.chargeType === '其他'} />} label="其他" />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">临床诊断：{[...data.prescription, data.customPrescription].join('，')}</Typography>
          </Grid>
        </Grid>
      </div>
      <Divider orientation="horizontal" className="divider" />
      <Typography variant="h6">RP</Typography>
      <Box flex={1} marginBottom={2}>
        {data.medDoses.map((md, i) => (
          <Box key={i}>
            <Grid container spacing={2} className="dense-grid" style={{ marginBottom: 12 }}>
              {md.medUsages.map((med, j) => (
                <React.Fragment key={j}>
                  {!!med.skinTest && (
                    <Fragment>
                      <Grid item xs={3}>{med.medicine?.split('-')[0]}</Grid>
                      <Grid item xs={3}>{med.medicine?.split('-')[1]}</Grid>
                      <Grid item xs={2}>{med.skinTest}</Grid>
                    </Fragment>
                  )}
                  {!med.skinTest && (
                    <Fragment>
                      <Grid item xs={4}>{med.medicine?.split('-')[0]}</Grid>
                      <Grid item xs={4}>{med.medicine?.split('-')[1]}</Grid>
                    </Fragment>
                  )}
                  {/* <Grid item xs={5} display="flex" flexDirection="row">
                    <Typography>{med.doseQuantities[0]?.quantity}{med.doseQuantities[0]?.unit}</Typography>；
                    <Typography>{med.doseQuantities[1]?.quantity}{med.doseQuantities[1]?.unit}</Typography>
                  </Grid> */}
                  <Grid item xs={1.5} display="flex" flexDirection="row">
                    <span style={{ marginRight: '0.5em' }}>{med.amount}</span>
                    {med.container}
                  </Grid>
                  <Grid item xs={2.5} display="flex" flexDirection="row">
                    <span style={{ marginRight: '0.5em' }}>每次</span>
                    <span style={{ marginRight: '0.5em' }}>{med.amountPerDose?.quantity}</span>
                    {med.amountPerDose?.unit}
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3}>Sig:</Grid>
              <Grid item xs={3}>{md.doseMethod?.way}</Grid>
              <Grid item xs={2}>{md.doseMethod?.rate}{md.doseMethod?.rateUnit}</Grid>
              <Grid item xs={2}>{md.doseMethod?.frequency}</Grid>
              <Grid item xs={2}>{md.doseMethod?.days}天</Grid>
            </Grid>
            <Divider orientation="horizontal" className="divider" />
          </Box>
        ))}
      </Box>
      <Box>
        <Grid container justifyContent="flex-end">
          <Grid item xs={6}>
            <Typography>医师签名：</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={0} sx={{ borderTop: '2px solid darkgrey', borderBottom: '2px solid darkgrey' }}>
          <Grid item xs={4} sx={{ borderRight: '2px solid darkgrey', padding: '0 8px' }}>
            <p>审核，发药：</p>
            <p>收费员：</p>
          </Grid>
          <Grid item xs={4} sx={{ borderRight: '2px solid darkgrey', padding: '0 8px' }}>
            <p>药费：</p>
            <p>其他费：</p>
            <p>合计：</p>
          </Grid>
          <Grid item xs={4} sx={{ padding: '0 8px' }}>
            <p>新农合补助：</p>
            <p>审核人签字：</p>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default PrintVersion;