import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../utils/test-utils'

describe('Simple Integration Test', () => {
  it('renders a simple component', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})