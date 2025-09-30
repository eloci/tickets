import { NextRequest, NextResponse } from 'next/server'; 
  
export async function POST(request: NextRequest) {  
  try {  
    return NextResponse.json(  
      { error: 'QR code scanning not yet implemented' },  
      { status: 501 }  
    );  
  } catch (error) {  
    return NextResponse.json(  
      { error: 'Internal server error' },  
      { status: 500 }  
    );  
  }  
} 
