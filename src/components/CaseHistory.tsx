import { Typography } from '@mui/material'
import { Timeline } from 'antd'
import type { CaseEvent } from '../api'

// The case's append-only history (FR-003), newest last, as the diagram was walked.

export function CaseHistory({ events, nodeLabel }: { events: CaseEvent[]; nodeLabel: (node: string) => string }) {
  if (events.length === 0)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No history yet.
      </Typography>
    )

  return (
    <Timeline
      items={events.map((event, i) => ({
        key: event.id,
        color: event.from_node === null ? 'blue' : i === events.length - 1 ? 'green' : 'gray',
        content: (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {event.from_node === null ? 'Raised at: ' : event.outcome ? `${event.outcome} → ` : ''}
              {nodeLabel(event.to_node)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {event.actor_name} · {new Date(event.created_at).toLocaleString()}
            </Typography>
            {event.note && (
              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                “{event.note}”
              </Typography>
            )}
          </>
        ),
      }))}
    />
  )
}
