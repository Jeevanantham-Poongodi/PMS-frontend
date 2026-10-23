import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { CaseLine } from '../api'
import { ExpiryChip } from './ExpiryChip'

// A case's lines: item, batch, expiry, location and quantities (FR-030).

export function LinesTable({ lines }: { lines: CaseLine[] }) {
  if (lines.length === 0)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No lines.
      </Typography>
    )

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Item</TableCell>
          <TableCell>Batch</TableCell>
          <TableCell>Expiry</TableCell>
          <TableCell>Location</TableCell>
          <TableCell align="right">Requested</TableCell>
          <TableCell align="right">Approved</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.id}>
            <TableCell>{line.item_name}</TableCell>
            <TableCell>{line.batch_no ?? '—'}</TableCell>
            <TableCell>{line.expiry_date ? <ExpiryChip date={line.expiry_date} /> : '—'}</TableCell>
            <TableCell>{line.location_name ?? '—'}</TableCell>
            <TableCell align="right">{Number(line.qty_requested)}</TableCell>
            <TableCell align="right">{line.qty_approved === null ? '—' : Number(line.qty_approved)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
