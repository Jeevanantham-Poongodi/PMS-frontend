import { useEffect, useState } from 'react'
import { Alert, FormControlLabel, LinearProgress, MenuItem, Radio, RadioGroup, TextField } from '@mui/material'
import { api } from '../../api'
import { useAsync } from '../../hooks/useAsync'
import { labelsOf } from '../../labels'
import type { FormProps } from './NewCaseDialog'

// F5:"Recall notice from regulator or vendor": the recalled batch and who sent the notice. The
// backend finds every location holding it at the next step.
export function RecallForm({ onChange }: FormProps) {
  const { data: batches, error } = useAsync(() => api.batches(), 'recall-batches')
  const [batchId, setBatchId] = useState('')
  const [source, setSource] = useState('regulator')
  const [reference, setReference] = useState('')

  useEffect(() => {
    const batch = batches?.find((b) => String(b.id) === batchId)
    const ref = reference.trim()
    onChange(
      batch
        ? {
            flow: 5,
            start: 'f5_notice',
            title: `Recall ${batch.item_name} ${batch.batch_no}${ref ? ` (${ref})` : ''}`,
            data: { batch_id: batch.id, source },
          }
        : null,
    )
  }, [batches, batchId, source, reference, onChange])

  if (error) return <Alert severity="error">{error}</Alert>
  if (!batches) return <LinearProgress />

  const open = batches.filter((b) => !b.blocked)
  return (
    <>
      <RadioGroup row value={source} onChange={(e) => setSource(e.target.value)}>
        {labelsOf('source').map(([code, text]) => (
          <FormControlLabel key={code} value={code} control={<Radio />} label={`From ${text.toLowerCase()}`} />
        ))}
      </RadioGroup>
      <TextField select label="Recalled batch" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
        {open.map((b) => (
          <MenuItem key={b.id} value={String(b.id)}>
            {b.item_name} · {b.batch_no} · expires {b.expiry_date}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Notice reference (optional)"
        placeholder="e.g. CDSCO alert 2026/114"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
    </>
  )
}
