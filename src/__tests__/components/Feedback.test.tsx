import { render, screen } from '@testing-library/react'
import Feedback from '@/components/Feedback'

describe('Feedback', () => {
  it('should render feedback container', () => {
    render(<Feedback />)
    
    const feedbackElement = screen.getByTestId('feedback')
    expect(feedbackElement).toBeInTheDocument()
    expect(feedbackElement).toHaveClass('feedback')
    expect(feedbackElement).toHaveAttribute('id', 'feedback')
  })

  it('should have correct CSS classes', () => {
    render(<Feedback />)
    
    const feedbackElement = screen.getByTestId('feedback')
    expect(feedbackElement).toHaveClass('feedback')
  })

  it('should have correct id attribute', () => {
    render(<Feedback />)
    
    const feedbackElement = screen.getByTestId('feedback')
    expect(feedbackElement).toHaveAttribute('id', 'feedback')
  })
})
