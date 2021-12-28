/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { 
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Box,
  InputLabel,
  ListSubheader,
  Button,
  Fab,
  Dialog,
  Paper,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RemoveIcon from '@mui/icons-material/Remove';
import ClearIcon from '@mui/icons-material/ClearAll';
import { getMeds, IMedGroup } from '../../parser';
import { DatePicker } from '@mui/lab';
import ReactToPrint from 'react-to-print';
import PrintVersion from '../print-version';
import * as _ from 'lodash';

export interface IDose {
  quantity?: number
  unit?: string
}
export interface IDoseMethod {
  way: string
  rate: number
  rateUnit: '滴/分'
  days: number
  frequency: string
}
export interface IMedUsage {
  skinTest?: string
  medicine?: string
  doseQuantities: IDose[]
  amount?: number
  container?: string
  amountPerDose?: IDose
}
export interface IMedDose {
  medUsages: IMedUsage[]
  doseMethod: IDoseMethod
}
export interface IPrescription {
  presNo?: string
  issueDate?: Date | null
  patientName?: string
  patientGender?: string
  patientAge?: number
  patientAddr?: string
  departmentName?: string
  chargeType?: string
  prescription?: string[]
  customPrescription?: string
  medDoses: IMedDose[]
}

function getEmptyMedUsage(): IMedUsage {
  return {
    doseQuantities: [],
    medicine: '',
    amount: '' as any,
    container: '瓶',
    amountPerDose: {
      quantity: '' as any,
      unit: 'ml'
    }
  };
}
function getMedDose(): IMedDose {
  return {
    medUsages: [getEmptyMedUsage()],
    doseMethod: { ...StandardDoseMethod }
  }
}
function getPrescription(): IPrescription {
  return {
    medDoses: [{ ...getMedDose() }],
    patientAddr: '',
    patientAge: '' as any,
    patientGender: '男',
    patientName: '',
    issueDate: new Date(),
    chargeType: '自费',
    departmentName: '中西医结合科/中医科',
    presNo: '',
    prescription: []
  };
}

const StandardDoseMethod: IDoseMethod = {
  way: '静脉滴注',
  rate: 30,
  rateUnit: '滴/分',
  days: 1,
  frequency: 'qd'
};

const Prescription = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<IPrescription>({ ...getPrescription() });
  const [print, setPrint] = useState<boolean>(false);
  const [metaMeds, setMetaMeds] = useState<IMedGroup[]>([]);
  const [dps, setDps] = useState<any[]>([]);
  const [confirmation, setConfirmation] = useState(false);
  const handleMedUsageChange = (index: number) => (usages: IMedUsage[]) => {
    const doses = data.medDoses;
    doses.splice(index, 1, {
      medUsages: usages,
      doseMethod: doses[index].doseMethod
    });
    setData({
      ...data,
      medDoses: doses
    })
  };
  const handleMedDoseMethodChange = (index: number, field: keyof IDoseMethod) => (e: any) => {
    const doses = data.medDoses.concat();
    const old = doses[index];
    doses.splice(index, 1, {
      medUsages: old.medUsages,
      doseMethod: {
        ...old.doseMethod,
        [field]: e.target.value
      }
    });
    setData({ ...data, medDoses: doses });
  }
  const handleAddMedDose = () => {
    setData({
      ...data,
      medDoses: [
        ...data.medDoses,
        { ...getMedDose() }
      ]
    });
  }
  const handleAddMedUsage = (index: number) => () => {
    const doses = data.medDoses;
    const old = doses[index];
    doses.splice(index, 1, {
      medUsages: [
        ...old.medUsages,
        getEmptyMedUsage()
      ],
      doseMethod: old.doseMethod
    });
    setData({
      ...data,
      medDoses: [...doses]
    });
  }
  const handleClear = () => {
    setData({ ...getPrescription(), medDoses: [] });
    setConfirmation(false);
  }
  useEffect(() => {
    getMeds()
      .then(([metaMeds, defaultPrescriptions]) => {
        setMetaMeds(metaMeds);
        setDps(defaultPrescriptions);
      });
  }, [0])
  return (
    <Box sx={{ width: 1400, margin: 'auto' }}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            margin="normal"
            label="病历号（门诊口/住院口）"
            variant="standard"
            value={data.presNo}
            onChange={e => setData({ ...data, presNo: e.target.value })}
          />
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={4} alignItems="center" justifyContent="flex-end">
          <DatePicker
            mask="____-__-__"
            inputFormat="yyyy-MM-dd"
            value={data.issueDate}
            onChange={date => setData({ ...data, issueDate: date })}
            renderInput={(params) => (<TextField
              {...params}
              fullWidth
              margin="normal"
              label="开具日期"
              variant="standard"
            />)}
          />
        </Grid>
      </Grid>
      <Divider orientation="horizontal" />
      <div className="patient-infos" aria-details="patient infos">
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              margin="normal"
              label="姓名"
              variant="standard"
              value={data.patientName}
              onChange={e => setData({ ...data, patientName: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>性别</InputLabel>
              <Select
                label="性别"
                value={data.patientGender}
                onChange={e => setData({ ...data, patientGender: e.target.value })}>
                <MenuItem value="男">男</MenuItem>
                <MenuItem value="女">女</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              InputProps={{ inputProps: { min: 0 }}}
              margin="normal"
              label="年龄（岁）"
              variant="standard"
              type="number"
              value={data.patientAge}
              onChange={e => setData({ ...data, patientAge: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              margin="normal"
              label="住址/电话"
              variant="standard"
              value={data.patientAddr}
              onChange={e => setData({ ...data, patientAddr: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              margin="normal"
              label="科别"
              variant="standard"
              value={data.departmentName}
              onChange={e => setData({ ...data, departmentName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>费别：</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={data.chargeType}
                onChange={e => setData({ ...data, chargeType: e.target.value })}>
                <FormControlLabel value="自费" control={<Radio />} label="自费" />
                <FormControlLabel value="新农合" control={<Radio />} label="新农合" />
                <FormControlLabel value="医保" control={<Radio />} label="医保" />
                <FormControlLabel value="保健对象" control={<Radio />} label="保健对象" />
                <FormControlLabel value="其他" control={<Radio />} label="其他" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ marginBottom: 2 }}>
            <Stack direction="row">
              <FormControl margin="none" sx={{ flex: 1, marginRight: 2 }}>
                <InputLabel>临床诊断</InputLabel>
                <Select
                  label="临床诊断"
                  multiple
                  value={data.prescription}
                  onChange={e => {
                    const ps = typeof e.target.value === 'string' ? [e.target.value] : e.target.value;
                    setData({ ...data, prescription: ps });
                  }}>
                  {dps.map(({ system, prescriptions }) => {
                    const items = prescriptions.map(({ name, content }: any) => (
                      <MenuItem key={`${system}-${name}`} value={content}>{name}</MenuItem>
                    ));
                    return [
                      <ListSubheader key={system} color="primary">-- {system} --</ListSubheader>,
                      items
                    ]
                  })}
                </Select>
              </FormControl>
              <TextField
                sx={{ flex: 1 }}
                multiline
                fullWidth
                rows={4}
                value={data.customPrescription}
                variant="outlined"
                label="临床诊断"
                onChange={e => setData({ ...data, customPrescription: e.target.value })}/>
            </Stack>
          </Grid>
        </Grid>
      </div>
      <Divider orientation="horizontal" />
      <Typography variant="h4">RP</Typography>
      {data.medDoses.map((md, i) => (
        <MedUsage
          key={i}
          index={i}
          medDose={md}
          metaMeds={metaMeds}
          onChange={handleMedUsageChange(i)}
          handleAddMedUsage={handleAddMedUsage}
          handleMedDoseMethodChange={handleMedDoseMethodChange}
        />
      ))}
      <Box sx={{ textAlign: 'right' }}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={handleAddMedDose}>
          添加点滴
        </Button>
      </Box>
      <Box sx={{ textAlign: 'center', marginTop: 4 }}>
        <Button
          color="secondary"
          variant="contained"
          size="large"
          style={{ marginRight: 16 }}
          startIcon={<ClearIcon />}
          onClick={() => setConfirmation(true)}>
          新药单
        </Button>
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={() => setPrint(true)}
          startIcon={<PrintIcon />}>
          打印
        </Button>
      </Box>
      <Dialog open={print} onClose={() => setPrint(false)} fullWidth maxWidth="lg" scroll="paper">
        <DialogTitle>打印诊断书</DialogTitle>
        <Box width={828} height={1260} overflow="auto" padding={2} border="2px solid lightgrey" margin="auto">
          <PrintVersion onRef={(ref) => printRef.current = ref} data={data} />
        </Box>
        <DialogActions>
          <ReactToPrint
            trigger={() => (
              <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  startIcon={<PrintIcon />}>
                  打印
                </Button>
              </Box>
            )}
            content={() => printRef.current}
          />
        </DialogActions>
      </Dialog>
      <Dialog open={confirmation} onClose={() => setConfirmation(false)}>
        <DialogTitle>新注射药单</DialogTitle>
        <DialogContent>
          <DialogContentText>
            开新注射药单将会清空已录入的信息
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="warning"
            variant="text"
            onClick={handleClear}
          >确认</Button>
          <Button color="primary" variant="text" onClick={() => setConfirmation(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

interface IMedUsageProps {
  medDose: IMedDose
  index: number
  metaMeds: IMedGroup[]
  onChange: (meds: IMedUsage[]) => void
  handleAddMedUsage: (index: number) => (e: any) => void
  handleMedDoseMethodChange: (index: number, way: string) => (e: any) => void
}
const MedUsage = React.memo(function ({ medDose, index, metaMeds, onChange, handleAddMedUsage, handleMedDoseMethodChange }: IMedUsageProps) {
  const { medUsages: meds, doseMethod } = medDose;
  const handleMedicineChange = (index: number) => (e: SelectChangeEvent<string>) => handleValueChange({
    field: 'medicine',
    index,
    value: e.target.value
  });
  const handleSkinTestChange = (index: number) => (e: SelectChangeEvent<string>) => handleValueChange({
    field: 'skinTest',
    index,
    value: e.target.value
  });
  const handleAmountChange = (index: number) => (e: any) => handleValueChange({
    field: 'amount',
    index,
    value: e.target.value
  });
  const handleContainerChange = (index: number) => (e: any) => handleValueChange({
    field: 'container',
    index,
    value: e.target.value
  });
  const handleAmountPerDoseChange = (index: number) => (dose: IDose) => handleValueChange({
    field: 'amountPerDose',
    index,
    value: dose
  });
  const handleValueChange = (params: { field: keyof IMedUsage, value: any, index: number }) => {
    const { field, value, index } = params;
    meds.splice(index, 1, {
      ...meds[index],
      [field]: value
    });
    onChange([...meds]);
  }
  const handleRemove = (index: number) => () => {
    meds.splice(index, 1);
    onChange([...meds]);
  }
  return (
    <Box>
      {/* <MedUsage meds={md.medUsages} onChange={handleMedUsageChange(i)} /> */}
      <Grid container spacing={2}>
        {meds.map((med, i) => (
          <React.Fragment key={i}>
            <Grid item xs={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>选择药品</InputLabel>
                <Select label="选择药品" value={med.medicine || ''} onChange={handleMedicineChange(i)}>
                  {metaMeds.map(({ system, meds: metaMed }) => {
                    const items = metaMed.map(({ name: medName, specification }) => (
                      <MenuItem key={`${system}-${medName}`} value={`${medName}-${specification}`}>{medName} - {specification}</MenuItem>
                    ));
                    return [
                      <ListSubheader key={system} color="primary">-- {system} --</ListSubheader>,
                      items
                    ];
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth margin="normal">
                <InputLabel>皮试/续用</InputLabel>
                <Select label="皮试/续用" value={med.skinTest} onChange={handleSkinTestChange(i)}>
                  <MenuItem value="">无需皮试</MenuItem>
                  <MenuItem value="皮试">皮试</MenuItem>
                  <MenuItem value="续用">续用</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3} display="flex" flexDirection="row">
              <TextField
                fullWidth
                margin="normal"
                variant="standard"
                value={med.amount}
                label="瓶/支数量"
                onChange={handleAmountChange(i)}
                style={{ marginRight: 8 }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>单位</InputLabel>
                <Select label="单位" value={med.container} onChange={handleContainerChange(i)}>
                  <MenuItem value="瓶">瓶</MenuItem>
                  <MenuItem value="支">支</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3} display="flex" flexDirection="row">
              <Typography sx={{ width: 50, lineHeight: 6, fontWeight: 'bold' }}>每次</Typography>
              <DoseEditor dose={med.amountPerDose} onChange={handleAmountPerDoseChange(i)} />
              <Fab
                color="default"
                style={{ marginTop: 14, marginLeft: 8 }}
                onClick={handleRemove(i)}>
                <RemoveIcon />
              </Fab>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'right' }}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={handleAddMedUsage(index)}>
          添加药品
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>Sig:</Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>注射类型</InputLabel>
            <Select label="滴注类型" value={doseMethod?.way} onChange={handleMedDoseMethodChange(index, 'way')}>
              <MenuItem value="静脉滴注">静脉滴注</MenuItem>
              <MenuItem value="肌肉注射">肌肉注射</MenuItem>
              <MenuItem value="皮下注射">皮下注射</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel>使用频率</InputLabel>
            <Select label="使用频率" value={doseMethod?.frequency} onChange={handleMedDoseMethodChange(index, 'frequency')}>
              <MenuItem value="qd">qd</MenuItem>
              <MenuItem value="bid">bid</MenuItem>
              <MenuItem value="tid">tid</MenuItem>
              <MenuItem value="qid">qid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            value={doseMethod?.rate}
            InputProps={{ inputProps: { min: 1 }}}
            variant="standard"
            type="number"
            label="滴注速率"
            onChange={handleMedDoseMethodChange(index, 'rate')}/>
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            InputProps={{ inputProps: { min: 1 }}}
            value={doseMethod?.days}
            variant="standard"
            type="number"
            label="天数"
            onChange={handleMedDoseMethodChange(index, 'days')}/>
        </Grid>
      </Grid>
      <Divider orientation="horizontal" style={{ margin: '8px 0' }} />
    </Box>
  )
})

interface IDoseEditorProps {
  onChange: (value: IDose) => void
  dose?: IDose
}
const DoseEditor = React.memo(function ({ onChange, dose }: IDoseEditorProps) {
  const { unit, quantity } = dose || {};
  const units = ['ml', 'l', 'g', 'kg', '万'];
  const handleQuantityChange = (e: any) => onChange({ ...dose, quantity: e.target.value });
  const handleUnitChange = (e: SelectChangeEvent<string>) => onChange({ ...dose, unit: e.target.value });
  return (
    <React.Fragment>
      <TextField
        label="数量/剂量"
        variant="standard"
        margin="normal"
        onChange={handleQuantityChange}
        value={quantity || ''}
        style={{ marginRight: 8 }}
      />
      <FormControl margin="normal" style={{ width: 110, marginRight: 8 }}>
        <InputLabel>单位</InputLabel>
        <Select label="单位" value={unit || ''} onChange={handleUnitChange}>
          <MenuItem style={{ fontStyle: "italic" }}>未选择</MenuItem>
          {units.map(u => (
            <MenuItem key={u} value={u}>{u}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </React.Fragment>
  )
})

export default Prescription;