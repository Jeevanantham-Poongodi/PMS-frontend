// @vitest-environment jsdom
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent, FlowDefinition, Me } from '../src/api'
import { CaseHistory } from '../src/components/CaseHistory'
import { FlowMap } from '../src/components/FlowMap'
import { LinesTable } from '../src/components/LinesTable'
import { AppShell } from '../src/layout/AppShell'

vi.mock('../src/supabaseClient', () => ({ auth: null, authConfigError: null }))

// jsdom has no matchMedia; antd's Timeline asks it for the screen size.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

const FLOW: FlowDefinition = {
  flow: 5,
  title: 'Recall',
  starts: ['f5_notice'],
  nodes: [
    { key: 'f5_notice', label: 'Recall notice from regulator or vendor', kind: 'start' },
    { key: 'f5_find', label: 'Find affected batches in all stores and wards', kind: 'task' },
    { key: 'f5_updated', label: 'Stock records updated', kind: 'end' },
  ],
  edges: [],
}

const EVENTS: CaseEvent[] = [
  { id: 1, from_node: null, outcome: null, to_node: 'f5_notice', actor_name: 'Asha', note: null, created_at: '2026-10-22T10:00:00Z' },
  { id: 2, from_node: 'f5_notice', outcome: null, to_node: 'f5_find', actor_name: 'Asha', note: 'CDSCO alert', created_at: '2026-10-22T10:05:00Z' },
]

const label = (node: string) => FLOW.nodes.find((n) => n.key === node)?.label ?? node

afterEach(cleanup)

describe('FlowMap', () => {
  it('lists every step in order and marks the current one', () => {
    render(<FlowMap flow={FLOW} current="f5_find" events={EVENTS} />)
    const steps = screen.getAllByRole('listitem')
    expect(steps.map((s) => s.textContent)).toEqual(FLOW.nodes.map((n) => n.label))
    expect(steps[1].getAttribute('aria-current')).toBe('step')
    expect(steps[0].getAttribute('aria-current')).toBeNull()
  })
})

describe('CaseHistory', () => {
  it('shows each move with its actor and note', () => {
    render(<CaseHistory events={EVENTS} nodeLabel={label} />)
    expect(screen.getByText(/Raised at: Recall notice/)).toBeTruthy()
    expect(screen.getByText('Find affected batches in all stores and wards')).toBeTruthy()
    expect(screen.getByText('“CDSCO alert”')).toBeTruthy()
  })
})

describe('LinesTable', () => {
  it('shows a dash for details not known yet', () => {
    render(
      <LinesTable
        lines={[
          { id: 1, item_id: 2, item_name: 'Ondansetron 4 mg injection', batch_id: null, batch_no: null, expiry_date: null, location_id: null, location_name: null, qty_requested: 24, qty_approved: null },
        ]}
      />,
    )
    const cells = screen.getAllByRole('cell').map((c) => c.textContent)
    expect(cells).toEqual(['Ondansetron 4 mg injection', '—', '—', '—', '24', '—'])
  })
})

describe('AppShell', () => {
  it('links to the dashboard, the five flows, stock and items, and highlights the current page', () => {
    const me: Me = { user_id: 'u', hospital_id: 1, display_name: 'Demo Admin', roles: ['admin'], permissions: [], mfa_satisfied: true }
    render(
      <MemoryRouter initialEntries={['/flows/recall']}>
        <AppShell me={me} health={{ status: 'ok', database: 'ok' }} onSignOut={() => {}}>
          <p>page</p>
        </AppShell>
      </MemoryRouter>,
    )
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]
    const links = Array.from(nav.querySelectorAll('a'))
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/', '/flows/procurement', '/flows/ward-indent', '/flows/dispensing', '/flows/expiry', '/flows/recall', '/stock', '/items',
    ])
    expect(links.find((a) => a.classList.contains('Mui-selected'))?.textContent).toBe('Recall')
    expect(screen.getByText('page')).toBeTruthy()
  })
})
