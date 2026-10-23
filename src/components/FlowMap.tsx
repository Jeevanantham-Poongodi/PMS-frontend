import { Box, Chip, Stack, Typography } from '@mui/material'
import { CheckOutlined } from '@ant-design/icons'
import type { CaseEvent, FlowDefinition } from '../api'

// The flow's steps in diagram order: where the case is now, where it has been, and the end steps.

export function FlowMap({ flow, current, events }: { flow: FlowDefinition; current: string; events: CaseEvent[] }) {
  const visited = new Set(events.flatMap((e) => [e.from_node, e.to_node]).filter((n): n is string => !!n))

  return (
    <Stack spacing={1}>
      <Box component="ol" aria-label={`Flow ${flow.flow} steps`} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, m: 0, p: 0, listStyle: 'none' }}>
        {flow.nodes.map((node) => {
          const isCurrent = node.key === current
          const wasVisited = !isCurrent && visited.has(node.key)
          const isEnd = node.kind === 'end'
          return (
            <Box component="li" key={node.key} aria-current={isCurrent ? 'step' : undefined}>
              <Chip
                size="small"
                label={node.label}
                icon={wasVisited ? <CheckOutlined /> : undefined}
                color={isCurrent ? 'primary' : wasVisited ? 'success' : 'default'}
                variant={isCurrent ? 'filled' : 'outlined'}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  py: 0.25,
                  fontWeight: isCurrent ? 600 : 400,
                  borderRadius: isEnd ? 1 : 4,
                  borderStyle: isEnd && !isCurrent && !wasVisited ? 'dashed' : 'solid',
                  opacity: isCurrent || wasVisited ? 1 : 0.75,
                  '& .MuiChip-label': { whiteSpace: 'normal' },
                  '& .MuiChip-icon': { fontSize: 12 },
                }}
              />
            </Box>
          )
        })}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Filled: current step · ✓ visited · square corners: end steps
      </Typography>
    </Stack>
  )
}
