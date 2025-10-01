export default function ImageTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Image Loading Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg mb-2">Test 1: Direct hardcoded path</h2>
          <img 
            src="/uploads/events/1759302096330-1.png" 
            alt="Test image 1" 
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('Test 1: Image loaded')}
            onError={() => console.log('Test 1: Image failed')}
          />
        </div>
        
        <div>
          <h2 className="text-lg mb-2">Test 2: Variable path</h2>
          <img 
            src={"/uploads/events/1759302096330-1.png"} 
            alt="Test image 2" 
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('Test 2: Image loaded')}
            onError={() => console.log('Test 2: Image failed')}
          />
        </div>
        
        <div>
          <h2 className="text-lg mb-2">Test 3: Direct URL access</h2>
          <a 
            href="/uploads/events/1759302096330-1.png" 
            target="_blank"
            className="text-blue-500 underline"
          >
            Click to open image directly
          </a>
        </div>
      </div>
    </div>
  )
}