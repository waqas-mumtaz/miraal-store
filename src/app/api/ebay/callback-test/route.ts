import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    return NextResponse.json({
      success: true,
      code: code ? 'Present' : 'Missing',
      state: state ? 'Present' : 'Missing',
      error: error || 'None',
      message: 'Callback test successful'
    })
    
  } catch (error) {
    console.error('Callback test error:', error)
    return NextResponse.json(
      { 
        error: 'Callback test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
